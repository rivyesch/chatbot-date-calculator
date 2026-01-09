# KeyReply Custom Plugin Setup Guide

 

## How to Add Meal Prep Date Calculator as Custom Plugin

 

### Step 1: Host the Function on Your Server

 

Your CTO needs to add the API endpoint first (see previous instructions).

 

**Endpoint URL:** `https://your-server.com/api/calculate-meal-prep-dates`

 

---

 

### Step 2: Upload Plugin to KeyReply

 

In your KeyReply dashboard:

 

1. **Go to Custom Plugins section**

2. **Click "Add Custom Plugin"**

3. **Fill in the form:**

 

   | Field | Value |

   |-------|-------|

   | **Plugin Name** | `Meal Prep Date Calculator` |

   | **Plugin File** | Upload `meal-prep-date-calculator-swagger.json` |

   | **Authentication** | Select based on your setup: |

   |  | - `None` (if internal server, no auth needed) |

   |  | - `Bearer` (if using JWT tokens) |

   |  | - `Basic` (if using username/password) |

   |  | - `X-API-Key` (if using API keys) |

 

4. **Update the host** in the JSON file before uploading:

   ```json

   "host": "your-actual-server.com",  // Change this!

   "basePath": "/api",

   "schemes": ["https"]  // or ["http"] for localhost

   ```

 

5. **Save the plugin**

 

---

 

### Step 3: Configure Gen AI Persona

 

1. **Open your Gen AI Persona** (e.g., "Meal Prep Assistant")

 

2. **In Persona Settings → Plugin Configuration:**

 

   Add the custom plugin:

   ```json

   {

     "custom": [

       {

         "name": "Meal Prep Date Calculator",

         "enabled": true

       }

     ]

   }

   ```

 

3. **Update the System Prompt:**

 

   ```

   You are a meal prep assistant helping users sign up for programs.

 

   When users want to sign up:

   1. Collect their desired program start date

   2. Use the calculate_meal_prep_dates function to get available delivery dates

   3. Present the dates naturally to the user

 

   IMPORTANT: Always use the date calculator function. Do NOT try to

   calculate dates yourself - you will get Sundays and holidays wrong!

   ```

 

4. **Save the persona**

 

---

 

### Step 4: Test the Integration

 

**Test in KeyReply Chat:**

 

```

User: I want to sign up for meal prep starting January 20th

 

Expected Flow:

1. AI recognizes the request

2. AI calls calculate_meal_prep_dates function

3. AI receives available dates

4. AI presents: "Here are your available delivery dates:

   - Tuesday, January 13

   - Wednesday, January 14

   - Thursday, January 15..."

```

 

---

 

## If Using Flow-Based Approach Instead

 

If your KeyReply doesn't support auto function calling, use the **Content Node** approach:

 

### Visual Flow Editor:

 

```

┌─────────────────────────────────────┐

│  [Gen AI Persona Node]              │

│  "Collect signup and start dates"   │

│  Extract: state.program_start_date  │

└───────────────┬─────────────────────┘

                │

                ▼

┌─────────────────────────────────────┐

│  [API Call Event]                   │

│  URL: /api/calculate-meal-prep-dates│

│  Method: POST                        │

│  Body: {                             │

│    "programStartDate": "{{state...}}"│

│    "calculation": "d1"               │

│  }                                   │

└───────────────┬─────────────────────┘

                │

                ▼

┌─────────────────────────────────────┐

│  [Map Response]                     │

│  $.calculations.delivery1...        │

│    → state.d1_dates                 │

└───────────────┬─────────────────────┘

                │

                ▼

┌─────────────────────────────────────┐

│  [Gen AI Persona Node]              │

│  Context: "Dates: {{state.d1_dates}}"│

│  "Present dates naturally"          │

└─────────────────────────────────────┘

```

 

---

 

## Authentication Options

 

### None (Recommended for Internal)

```json

{

  "authentication": "none"

}

```

 

### Bearer Token

```json

{

  "authentication": "bearer",

  "token": "your-jwt-token"

}

```

 

### API Key

```json

{

  "authentication": "x-api-key",

  "apiKey": "your-api-key",

  "headerName": "X-API-Key"

}

```

 

### Basic Auth

```json

{

  "authentication": "basic",

  "username": "your-username",

  "password": "your-password"

}

```

 

---

 

## Testing the Plugin

 

### 1. Test Endpoint Directly

 

```bash

curl -X POST https://your-server.com/api/calculate-meal-prep-dates \

  -H "Content-Type: application/json" \

  -d '{

    "signupDate": "2026-01-09",

    "programStartDate": "2026-01-20",

    "calculation": "d1"

  }'

```

 

Should return JSON with available dates.

 

### 2. Test in KeyReply

 

Start a conversation with your persona:

 

**Test 1: Program Start Date**

```

User: "I want to sign up for meal prep"

AI: "When would you like to start?"

User: "January 20th"

AI: [Should calculate and show delivery options]

```

 

**Test 2: Full Flow**

```

User: "Show me delivery options for a program starting Jan 20"

AI: [Should automatically call function and present dates]

```

 

---

 

## Troubleshooting

 

### Plugin Not Appearing

- ✅ Check plugin uploaded correctly

- ✅ Verify host URL is correct in JSON

- ✅ Ensure persona has plugin enabled

 

### Function Not Being Called

- ✅ Check system prompt mentions using the function

- ✅ Verify OpenAI function calling is enabled in persona

- ✅ Test endpoint directly with curl first

 

### Wrong Dates Returned

- ✅ Check timezone settings

- ✅ Verify date format is YYYY-MM-DD

- ✅ Test with `node test-meal-prep-api.js`

 

### Authentication Errors

- ✅ Verify auth type matches your server

- ✅ Check credentials are correct

- ✅ Test endpoint with Postman/curl including auth headers

 

---

 

## Summary

 

**3 Files You Need:**

1. ✅ `meal-prep-date-calculator.js` → Your CTO adds to server

2. ✅ `meal-prep-date-calculator-swagger.json` → Upload as custom plugin

3. ✅ Configure persona to use the plugin

 

**Result:**

- AI can call date calculations automatically

- No more wrong Sundays or date logic errors

- Deterministic, reliable results every time

 

---

 

## Questions?

 

If the plugin doesn't work as expected, check:

1. Is the endpoint responding? (test with curl)

2. Is the Swagger JSON valid? (use swagger.io/tools/swagger-editor)

3. Is authentication configured correctly?

4. Does the persona's system prompt mention using the function?