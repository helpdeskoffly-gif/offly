## Updated EmailJS Template HTML

Replace your current template with this updated version that includes attachment support:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Feedback from {{from_name}}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8fafc;
        }
        .email-container {
            background: white;
            border-radius: 12px;
            padding: 30px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #e2e8f0;
        }
        .logo {
            width: 120px;
            height: auto;
            margin-bottom: 15px;
        }
        .title {
            color: #6366f1;
            font-size: 24px;
            font-weight: 600;
            margin: 0;
        }
        .subtitle {
            color: #64748b;
            font-size: 14px;
            margin: 5px 0 0 0;
        }
        .content {
            margin: 25px 0;
        }
        .field {
            margin-bottom: 20px;
        }
        .field-label {
            font-weight: 600;
            color: #475569;
            font-size: 14px;
            margin-bottom: 5px;
            display: block;
        }
        .field-value {
            background: #f1f5f9;
            padding: 12px 15px;
            border-radius: 8px;
            border-left: 4px solid #6366f1;
            font-size: 15px;
        }
        .message-box {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
            white-space: pre-wrap;
            font-family: inherit;
            line-height: 1.6;
        }
        .attachment-section {
            background: #fef3c7;
            border: 1px solid #f59e0b;
            border-radius: 8px;
            padding: 15px;
            margin: 20px 0;
        }
        .attachment-title {
            color: #92400e;
            font-weight: 600;
            margin-bottom: 10px;
        }
        .attachment-info {
            color: #78350f;
            font-size: 14px;
        }
        .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
            text-align: center;
            color: #64748b;
            font-size: 12px;
        }
        .timestamp {
            color: #94a3b8;
            font-size: 12px;
            margin-top: 10px;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <div style="width: 120px; height: 60px; background: linear-gradient(135deg, #6366f1, #8b5cf6); border-radius: 12px; margin: 0 auto 15px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 18px;">
                OFFLY
            </div>
            <h1 class="title">New Feedback Received</h1>
            <p class="subtitle">Someone has sent feedback through your website</p>
        </div>

        <div class="content">
            <div class="field">
                <span class="field-label">👤 From:</span>
                <div class="field-value">{{from_name}}</div>
            </div>

            <div class="field">
                <span class="field-label">📧 Email:</span>
                <div class="field-value">{{from_email}}</div>
            </div>

            <div class="field">
                <span class="field-label">💬 Message:</span>
                <div class="message-box">{{message}}</div>
            </div>

            {{#if attachment_name}}
            <div class="attachment-section">
                <div class="attachment-title">📎 Attachment Included</div>
                <div class="attachment-info">
                    <strong>File:</strong> {{attachment_name}}<br>
                    <strong>Size:</strong> {{attachment_size}}<br>
                    <strong>Type:</strong> {{attachment_type}}
                </div>
                {{#if attachment_note}}
                <div style="margin-top: 10px; font-style: italic;">
                    {{attachment_note}}
                </div>
                {{/if}}
            </div>
            {{/if}}

            <div class="field">
                <span class="field-label">🌐 Browser Info:</span>
                <div class="field-value" style="font-size: 12px; color: #64748b;">{{user_agent}}</div>
            </div>
        </div>

        <div class="footer">
            <p>This email was sent automatically from your Offly feedback form.</p>
            <p class="timestamp">Received on {{sent_date}} at {{sent_time}}</p>
        </div>
    </div>
</body>
</html>
```

## Instructions:

1. **Go to your EmailJS dashboard**
2. **Edit your template** (template_omrzrib)
3. **Replace the HTML content** with the code above
4. **Save the template**

The updated template now includes:
- ✅ Attachment file information (name, size, type)
- ✅ Better styling for attachments
- ✅ Browser information for debugging
- ✅ Improved logo placeholder (since we can't easily host the SVG)

**Note:** EmailJS has limitations with file attachments in the free tier. Large files might not work, but the template will show attachment info regardless.
