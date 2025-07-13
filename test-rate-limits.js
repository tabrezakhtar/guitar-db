const axios = require("axios");

const BASE_URL = "http://localhost:5000";
const DELAY_BETWEEN_REQUESTS = 100;

const testData = {
  createProfile: {
    username: "testuser",
    email: "test@example.com",
    bio: "Test user for rate limiting",
    location: "Test City",
    website: "https://test.com"
  },
  magicLink: {
    email: "test@example.com"
  },
  refreshToken: {
    token: ""
  }
};

const makeRequest = async (method, url, data = null, headers = {}) => {
  try {
    const config = {
      method,
      url: `${BASE_URL}/api/${url}`,
      headers: {
        "Content-Type": "application/json",
        ...headers
      }
    };
    console.log(config.url)
    if (data) {
      config.data = data;
    }
    
    const response = await axios(config);
    return {
      success: true,
      status: response.status,
      data: response.data,
      headers: response.headers
    };
  } catch (error) {
    return {
      success: false,
      status: error.response?.status || 0,
      data: error.response?.data || error.message,
      headers: error.response?.headers || {}
    };
  }
};

const displayRateLimitInfo = (headers) => {
  const rateLimitHeaders = {};
  Object.keys(headers).forEach(key => {
    if (key.toLowerCase().startsWith("ratelimit-")) {
      rateLimitHeaders[key] = headers[key];
    }
  });
  return rateLimitHeaders;
};

const testEndpoint = async (name, method, url, data, maxRequests, expectedLimit) => {
  console.log(`\n🧪 Testing ${name}`);
  console.log(`Expected limit: ${expectedLimit} requests`);
  console.log("=" .repeat(50));
  
  let successCount = 0;
  let rateLimitedCount = 0;
  
  for (let i = 1; i <= maxRequests; i++) {
    const result = await makeRequest(method, url, data);
    const rateLimitInfo = displayRateLimitInfo(result.headers);
    
    if (result.success) {
      successCount++;
      console.log(`✅ Request ${i}: SUCCESS (${result.status})`);
      if (Object.keys(rateLimitInfo).length > 0) {
        console.log(`   Rate limit info:`, rateLimitInfo);
      }
    } else if (result.status === 429) {
      rateLimitedCount++;
      console.log(`🚫 Request ${i}: RATE LIMITED (${result.status})`);
      console.log(`   Message: ${result.data.message}`);
      if (Object.keys(rateLimitInfo).length > 0) {
        console.log(`   Rate limit info:`, rateLimitInfo);
      }
    } else {
      console.log(`❌ Request ${i}: ERROR (${result.status}) - ${result.data.message || result.data}`);
    }
    
    if (i < maxRequests) {
      await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_REQUESTS));
    }
  }
  
  console.log(`\n📊 Summary for ${name}:`);
  console.log(`   Successful requests: ${successCount}`);
  console.log(`   Rate limited requests: ${rateLimitedCount}`);
  console.log(`   Expected to be rate limited after: ${expectedLimit} requests`);
  
  if (rateLimitedCount > 0 && successCount <= expectedLimit) {
    console.log(`   ✅ Rate limiting is working correctly!`);
  } else if (rateLimitedCount === 0) {
    console.log(`   ⚠️  No rate limiting detected - check configuration`);
  } else {
    console.log(`   ⚠️  Unexpected behavior - review results`);
  }
};

const runRateLimitTests = async () => {
  console.log("🚀 Starting Rate Limit Tests");
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Delay between requests: ${DELAY_BETWEEN_REQUESTS}ms`);
  
  console.log("\n🔍 Checking if server is running...");
  try {
    const healthCheck = await makeRequest("GET", "/equipment/list");
    if (healthCheck.success) {
      console.log("✅ Server is running and responding");
    } else {
      console.log("❌ Server is not responding properly");
      console.log(`   Status: ${healthCheck.status}`);
      console.log(`   Response: ${JSON.stringify(healthCheck.data)}`);
      return;
    }
  } catch (error) {
    console.log("❌ Cannot connect to server");
    console.log(`   Make sure your server is running on ${BASE_URL}`);
    console.log(`   Error: ${error.message}`);
    return;
  }
  
  try {
    await testEndpoint(
      "User Registration",
      "POST",
      "/auth/register",
      testData.createProfile,
      8,
      5
    );
    
    await testEndpoint(
      "Magic Link Requests",
      "POST", 
      "/auth/sendMagicLink",
      testData.magicLink,
      6,
      3
    );
    
    console.log(`\n🧪 Testing Token Refresh`);
    
    const testTokenRefresh = async () => {
      console.log(`Expected limit: 20 requests`);
      console.log("=" .repeat(50));
      
      let successCount = 0;
      let rateLimitedCount = 0;
      
      for (let i = 1; i <= 25; i++) {
        const result = await makeRequest("POST", "/auth/refreshToken", {}, {
          "Authorization": `Bearer ${testData.refreshToken.token}`
        });
        const rateLimitInfo = displayRateLimitInfo(result.headers);
        
        if (result.success) {
          successCount++;
          console.log(`✅ Request ${i}: SUCCESS (${result.status})`);
          if (Object.keys(rateLimitInfo).length > 0) {
            console.log(`   Rate limit info:`, rateLimitInfo);
          }
        } else if (result.status === 429) {
          rateLimitedCount++;
          console.log(`🚫 Request ${i}: RATE LIMITED (${result.status})`);
          console.log(`   Message: ${result.data.message}`);
          if (Object.keys(rateLimitInfo).length > 0) {
            console.log(`   Rate limit info:`, rateLimitInfo);
          }
        } else {
          console.log(`❌ Request ${i}: ERROR (${result.status}) - ${result.data.message || result.data}`);
        }
        
        if (i < 25) {
          await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_REQUESTS));
        }
      }
      
      console.log(`\n📊 Summary for Token Refresh:`);
      console.log(`   Successful requests: ${successCount}`);
      console.log(`   Rate limited requests: ${rateLimitedCount}`);
      console.log(`   Expected to be rate limited after: 20 requests`);
      
      if (rateLimitedCount > 0 && successCount <= 20) {
        console.log(`   ✅ Rate limiting is working correctly!`);
      } else if (rateLimitedCount === 0) {
        console.log(`   ⚠️  No rate limiting detected - check configuration`);
      } else {
        console.log(`   ⚠️  Unexpected behavior - review results`);
      }
    };
    
    await testTokenRefresh();
    
    console.log(`\n🎉 Rate limit testing completed!`);
    console.log(`\n💡 Tips:`);
    console.log(`   - Wait for the time windows to reset before running tests again`);
    console.log(`   - User Registration: 1 hour window`);
    console.log(`   - Magic Link: 5 minute window`);
    console.log(`   - Token Refresh: 5 minute window`);
    console.log(`   - Auth Verification: 15 minute window`);
    
  } catch (error) {
    console.error("❌ Error running tests:", error.message);
  }
};

const testSingleEndpoint = async (endpointName) => {
  switch (endpointName.toLowerCase()) {
    case "register":
    case "registration":
      await testEndpoint(
        "User Registration",
        "POST",
        "/auth/register",
        testData.createProfile,
        8,
        5
      );
      break;
      
    case "magiclink":
    case "magic":
      await testEndpoint(
        "Magic Link Requests",
        "POST",
        "/auth/sendMagicLink", 
        testData.magicLink,
        6,
        3
      );
      break;
      
    case "refresh":
    case "token": {
      console.log(`\n🧪 Testing Token Refresh (single endpoint)`);
      const testTokenRefresh = async () => {
        console.log(`Expected limit: 20 requests`);
        console.log("=" .repeat(50));
        
        let successCount = 0;
        let rateLimitedCount = 0;
        
        for (let i = 1; i <= 25; i++) {
          const result = await makeRequest("POST", "/auth/refreshToken", {}, {
            "Authorization": `Bearer ${testData.refreshToken.token}`
          });
          const rateLimitInfo = displayRateLimitInfo(result.headers);
          
          if (result.success) {
            successCount++;
            console.log(`✅ Request ${i}: SUCCESS (${result.status})`);
            if (Object.keys(rateLimitInfo).length > 0) {
              console.log(`   Rate limit info:`, rateLimitInfo);
            }
          } else if (result.status === 429) {
            rateLimitedCount++;
            console.log(`🚫 Request ${i}: RATE LIMITED (${result.status})`);
            console.log(`   Message: ${result.data.message}`);
            if (Object.keys(rateLimitInfo).length > 0) {
              console.log(`   Rate limit info:`, rateLimitInfo);
            }
          } else {
            console.log(`❌ Request ${i}: ERROR (${result.status}) - ${result.data.message || result.data}`);
          }
          
          if (i < 25) {
            await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_REQUESTS));
          }
        }
        
        console.log(`\n📊 Summary for Token Refresh:`);
        console.log(`   Successful requests: ${successCount}`);
        console.log(`   Rate limited requests: ${rateLimitedCount}`);
        console.log(`   Expected to be rate limited after: 20 requests`);
        
        if (rateLimitedCount > 0 && successCount <= 20) {
          console.log(`   ✅ Rate limiting is working correctly!`);
        } else if (rateLimitedCount === 0) {
          console.log(`   ⚠️  No rate limiting detected - check configuration`);
        } else {
          console.log(`   ⚠️  Unexpected behavior - review results`);
        }
      };
      await testTokenRefresh();
      break;
    }
    
    case "testapi":
    case "api": {
      console.log(`\n🧪 Testing Rate Limiting with Test API Endpoints`);
      console.log(`Testing dedicated test endpoints with very low limits`);
      
      const testApiEndpoints = async () => {
        console.log(`\n--- Testing Test Magic Link Endpoint (2 requests/minute) ---`);
        
        for (let i = 1; i <= 4; i++) {
          const result = await makeRequest("POST", "test/magic-link", {
            test: `request-${i}`
          });
          const rateLimitInfo = displayRateLimitInfo(result.headers);
          
          console.log(`\n--- Request ${i} ---`);
          console.log(`URL: ${BASE_URL}/api/test/magic-link`);
          console.log(`Status: ${result.status}`);
          console.log(`Success: ${result.success}`);
          
          if (result.success) {
            console.log(`✅ Request ${i}: SUCCESS (${result.status})`);
            console.log(`   Response:`, result.data);
            if (Object.keys(rateLimitInfo).length > 0) {
              console.log(`   Rate limit info:`, rateLimitInfo);
            }
          } else if (result.status === 429) {
            console.log(`🚫 Request ${i}: RATE LIMITED (${result.status})`);
            console.log(`   Message: ${result.data.message}`);
            if (Object.keys(rateLimitInfo).length > 0) {
              console.log(`   Rate limit info:`, rateLimitInfo);
            }
          } else {
            console.log(`❌ Request ${i}: ERROR (${result.status})`);
            console.log(`   Response:`, result.data);
          }
          
          if (i < 4) {
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        }
        
        console.log(`\n--- Testing Test Refresh Endpoint (3 requests/minute) ---`);
        
        for (let i = 1; i <= 5; i++) {
          const result = await makeRequest("POST", "test/refresh", {
            test: `refresh-${i}`
          });
          const rateLimitInfo = displayRateLimitInfo(result.headers);
          
          console.log(`\n--- Request ${i} ---`);
          console.log(`URL: ${BASE_URL}/api/test/refresh`);
          console.log(`Status: ${result.status}`);
          
          if (result.success) {
            console.log(`✅ Request ${i}: SUCCESS (${result.status})`);
            console.log(`   Response:`, result.data);
            if (Object.keys(rateLimitInfo).length > 0) {
              console.log(`   Rate limit info:`, rateLimitInfo);
            }
          } else if (result.status === 429) {
            console.log(`🚫 Request ${i}: RATE LIMITED (${result.status})`);
            console.log(`   Message: ${result.data.message}`);
            if (Object.keys(rateLimitInfo).length > 0) {
              console.log(`   Rate limit info:`, rateLimitInfo);
            }
          } else {
            console.log(`❌ Request ${i}: ERROR (${result.status})`);
            console.log(`   Response:`, result.data);
          }
          
          if (i < 5) {
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        }
      };
      
      await testApiEndpoints();
      break;
    }
    
    case "debug":
    case "test": {
      console.log(`\n🧪 Testing Rate Limiting with Debug Endpoint`);
      console.log(`This will test with a very low limit to verify rate limiting works`);
      
      const testDebug = async () => {
        console.log(`Expected limit: 3 requests (Magic Link)`);
        console.log("=" .repeat(50));
        
        let successCount = 0;
        let rateLimitedCount = 0;
        
        for (let i = 1; i <= 6; i++) {
          const result = await makeRequest("POST", "auth/sendMagicLink", {
            email: `debug${i}@example.com`
          });
          const rateLimitInfo = displayRateLimitInfo(result.headers);
          
          console.log(`\n--- Request ${i} ---`);
          console.log(`URL: ${BASE_URL}/api/auth/sendMagicLink`);
          console.log(`Status: ${result.status}`);
          console.log(`Success: ${result.success}`);
          
          if (result.success) {
            successCount++;
            console.log(`✅ Request ${i}: SUCCESS (${result.status})`);
            if (Object.keys(rateLimitInfo).length > 0) {
              console.log(`   Rate limit info:`, rateLimitInfo);
            }
          } else if (result.status === 429) {
            rateLimitedCount++;
            console.log(`🚫 Request ${i}: RATE LIMITED (${result.status})`);
            console.log(`   Message: ${result.data.message}`);
            if (Object.keys(rateLimitInfo).length > 0) {
              console.log(`   Rate limit info:`, rateLimitInfo);
            }
          } else {
            console.log(`❌ Request ${i}: ERROR (${result.status})`);
            console.log(`   Response:`, result.data);
          }
          
          if (i < 6) {
            await new Promise(resolve => setTimeout(resolve, 200));
          }
        }
        
        console.log(`\n📊 Debug Test Summary:`);
        console.log(`   Successful requests: ${successCount}`);
        console.log(`   Rate limited requests: ${rateLimitedCount}`);
        console.log(`   Expected to be rate limited after: 3 requests`);
        
        if (rateLimitedCount > 0) {
          console.log(`   ✅ Rate limiting is working correctly!`);
        } else {
          console.log(`   ⚠️  No rate limiting detected`);
          console.log(`   Check server logs for rate limiter debug messages`);
        }
      };
      await testDebug();
      break;
    }
      
    default:
      console.log(`❌ Unknown endpoint: ${endpointName}`);
      console.log(`Available endpoints: register, magiclink, refresh`);
  }
};

const args = process.argv.slice(2);

if (args.length > 0) {
  const command = args[0];
  if (command === "help" || command === "-h" || command === "--help") {
    console.log(`
🧪 Rate Limit Tester

Usage:
  node test-rate-limits.js              # Run all tests
  node test-rate-limits.js [endpoint]   # Test specific endpoint
  node test-rate-limits.js help         # Show this help

Available endpoints:
  register    - Test user registration rate limit
  magiclink   - Test magic link request rate limit
  refresh     - Test token refresh rate limit
  debug       - Test with detailed debugging info
  testapi     - Test dedicated test endpoints (low limits)

Examples:
  node test-rate-limits.js
  node test-rate-limits.js register
  node test-rate-limits.js magiclink
  node test-rate-limits.js refresh
  node test-rate-limits.js debug
  node test-rate-limits.js testapi
    `);
    process.exit(0);
  } else {
    testSingleEndpoint(command);
  }
} else {
  runRateLimitTests();
}
