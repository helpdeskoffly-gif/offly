import { createClient } from "@supabase/supabase-js";

// Validate required Supabase config
const requiredEnvVars = ["VITE_SUPABASE_URL", "VITE_SUPABASE_ANON_KEY"];

const missingVars = requiredEnvVars.filter(
  (varName) => !import.meta.env[varName],
);
if (missingVars.length > 0) {
  throw new Error(`Missing Supabase configuration: ${missingVars.join(", ")}`);
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: "pkce",
    // Add more robust OAuth callback handling
    storageKey: "sb-session",
    storage: window?.localStorage,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
  global: {
    headers: {
      "x-application-name": "nn-mood-tracker",
    },
  },
});

// Enhanced error handling and retry logic
const maxRetries = 3;

const withRetry = async (operation, operationName = "Supabase operation") => {
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      const result = await operation();
      return result;
    } catch (error) {
      attempt++;
      console.warn(
        `${operationName} attempt ${attempt} failed:`,
        error.message,
      );

      // Don't retry certain types of errors
      if (error.code === 'PGRST204' || error.code === 'PGRST116' || error.code === '23505') {
        console.error(`Non-retryable error for ${operationName}:`, error);
        throw error;
      }

      if (attempt >= maxRetries) {
        console.error(
          `All ${maxRetries} attempts failed for ${operationName}:`,
          error,
        );
        throw error;
      }

      // Exponential backoff
      const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
};

// Connection monitoring
if (typeof window !== "undefined") {
  window.addEventListener("online", () => {
    console.log("Network connection restored");
  });

  window.addEventListener("offline", () => {
    console.warn("Network connection lost - some features may be limited");
  });
}

// User capacity constant
export const USER_CAPACITY = 25;

// Helper functions for common operations
export const supabaseHelpers = {
  // Auth helpers
  async signUp(email, password, userData = {}) {
    return withRetry(async () => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData,
        },
      });
      if (error) throw error;
      return data;
    }, "Sign Up");
  },

  async signIn(email, password) {
    return withRetry(async () => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      return data;
    }, "Sign In");
  },

  async signInWithGoogle() {
    return withRetry(async () => {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
      return data;
    }, "Google Sign In");
  },

  async signOut() {
    return withRetry(async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    }, "Sign Out");
  },

  async getCurrentUser() {
    try {
      return await withRetry(async () => {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();
        if (error) throw error;
        return user;
      }, "Get Current User");
    } catch (err) {
      console.error("Failed to get current user:", err);
      // Check for session in localStorage as a fallback
      try {
        const session = JSON.parse(localStorage.getItem('sb-session'));
        if (session?.user) {
          console.log("Using cached session user as fallback");
          return session.user;
        }
      } catch (e) {
        console.error("No valid cached session:", e);
      }
      return null;
    }
  },

  // Database helpers
  async insert(table, data) {
    return withRetry(async () => {
      const { data: result, error } = await supabase
        .from(table)
        .insert(data)
        .select();
      if (error) throw error;
      return result;
    }, `Insert into ${table}`);
  },

  async update(table, id, data) {
    return withRetry(async () => {
      const { data: result, error } = await supabase
        .from(table)
        .update(data)
        .eq("id", id)
        .select();
      if (error) throw error;
      return result;
    }, `Update ${table}`);
  },

  async delete(table, id) {
    return withRetry(async () => {
      const { error } = await supabase.from(table).delete().eq("id", id);
      if (error) throw error;
    }, `Delete from ${table}`);
  },

  async select(table, columns = "*", filters = {}) {
    return withRetry(async () => {
      let query = supabase.from(table).select(columns);

      // Apply filters
      Object.entries(filters).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          query = query.in(key, value);
        } else if (typeof value === "object" && value.operator) {
          switch (value.operator) {
            case "gte":
              query = query.gte(key, value.value);
              break;
            case "lte":
              query = query.lte(key, value.value);
              break;
            case "gt":
              query = query.gt(key, value.value);
              break;
            case "lt":
              query = query.lt(key, value.value);
              break;
            case "like":
              query = query.like(key, value.value);
              break;
            case "ilike":
              query = query.ilike(key, value.value);
              break;
            default:
              query = query.eq(key, value.value);
          }
        } else {
          query = query.eq(key, value);
        }
      });

      const { data, error } = await query;
      if (error) throw error;
      return data;
    }, `Select from ${table}`);
  },

  // Real-time subscriptions
  subscribe(table, callback, filters = {}) {
    let channel = supabase
      .channel(`${table}_changes`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: table,
          ...filters,
        },
        callback,
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },
};

// Export the Supabase client and helpers
export { supabase };
export default supabase;
