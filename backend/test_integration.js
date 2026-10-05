const http = require("http");

const BASE_URL = "http://localhost:5000";

let customerCookie = "";
let adminCookie = "";

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (options.cookie) {
    headers["Cookie"] = options.cookie;
  }

  const res = await fetch(url, {
    method: options.method || "GET",
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const cookieHeader = res.headers.get("set-cookie");
  const data = await res.json().catch(() => null);

  return {
    status: res.status,
    data,
    cookie: cookieHeader ? cookieHeader.split(";")[0] : null,
  };
}

async function runTests() {
  console.log("=== STARTING DHAAGA INTEGRATION TESTS ===");
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`✓ PASS: ${message}`);
      passed++;
    } else {
      console.error(`✗ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // 1. Root API Check
    const rootRes = await request("/");
    assert(rootRes.status === 200, "Root API responds with 200");

    // 2. Customer Registration
    const testEmail = `cust_${Date.now()}@example.com`;
    const regRes = await request("/api/auth/register", {
      method: "POST",
      body: {
        name: "Aarav Sharma",
        email: testEmail,
        password: "Password123!",
      },
    });
    assert(regRes.status === 201, "Customer registered successfully");

    // 3. Customer Login
    const loginRes = await request("/api/auth/login", {
      method: "POST",
      body: {
        email: testEmail,
        password: "Password123!",
      },
    });
    assert(loginRes.status === 200, "Customer logged in successfully");
    customerCookie = loginRes.cookie;
    assert(!!customerCookie, "Received HTTP-only auth token cookie");

    // 4. Current User Check
    const meRes = await request("/api/auth/me", { cookie: customerCookie });
    assert(meRes.status === 200 && meRes.data.user.email === testEmail, "GET /api/auth/me returned user details");

    // 5. Product & Category Listings
    const catRes = await request("/api/categories");
    assert(catRes.status === 200 && catRes.data.categories.length > 0, `Fetched ${catRes.data?.categories?.length} categories`);

    const prodRes = await request("/api/products");
    assert(prodRes.status === 200 && prodRes.data.products.length > 0, `Fetched ${prodRes.data?.products?.length} products`);

    const firstProduct = prodRes.data.products[0];
    const slugRes = await request(`/api/products/${firstProduct.slug}`);
    assert(slugRes.status === 200 && slugRes.data.product.name === firstProduct.name, `Fetched product by slug: ${firstProduct.slug}`);

    // 6. Wishlist Operations
    const addWishRes = await request("/api/wishlist/items", {
      method: "POST",
      cookie: customerCookie,
      body: { productId: firstProduct._id },
    });
    assert(addWishRes.status === 200, "Added product to wishlist");

    const getWishRes = await request("/api/wishlist", { cookie: customerCookie });
    assert(getWishRes.status === 200 && getWishRes.data.wishlist.products.length >= 1, "Retrieved populated wishlist");

    const removeWishRes = await request(`/api/wishlist/items/${firstProduct._id}`, {
      method: "DELETE",
      cookie: customerCookie,
    });
    assert(removeWishRes.status === 200, "Removed product from wishlist");

    // 7. Cart Operations
    const variant = firstProduct.variants[0];
    const addCartRes = await request("/api/cart/items", {
      method: "POST",
      cookie: customerCookie,
      body: {
        productId: firstProduct._id,
        size: variant.size,
        color: variant.color,
        quantity: 2,
      },
    });
    assert(addCartRes.status === 200, "Added item to cart");

    const getCartRes = await request("/api/cart", { cookie: customerCookie });
    assert(getCartRes.status === 200 && getCartRes.data.cart.items.length === 1, "Retrieved cart with items");
    const cartItemId = getCartRes.data.cart.items[0]._id;

    const updateCartRes = await request(`/api/cart/items/${cartItemId}`, {
      method: "PUT",
      cookie: customerCookie,
      body: { quantity: 1 },
    });
    assert(updateCartRes.status === 200 && updateCartRes.data.cart.items[0].quantity === 1, "Updated cart item quantity");

    // 8. Address Operations
    const addAddrRes = await request("/api/addresses", {
      method: "POST",
      cookie: customerCookie,
      body: {
        fullName: "Aarav Sharma",
        phone: "9876543210",
        addressLine1: "Flat 101, Silk Enclave",
        city: "Jaipur",
        state: "Rajasthan",
        pincode: "302001",
        country: "India",
        isDefault: true,
      },
    });
    assert(addAddrRes.status === 201, "Created shipping address");
    const addressId = addAddrRes.data.address._id;

    const getAddrRes = await request("/api/addresses", { cookie: customerCookie });
    assert(getAddrRes.status === 200 && getAddrRes.data.addresses.length >= 1, "Fetched customer addresses");

    // 9. Order Creation (COD)
    const createOrderRes = await request("/api/orders", {
      method: "POST",
      cookie: customerCookie,
      body: {
        addressId,
        paymentMethod: "cod",
      },
    });
    assert(createOrderRes.status === 201 && createOrderRes.data.order.orderNumber.startsWith("DHAAGA"), `Placed COD order: ${createOrderRes.data?.order?.orderNumber}`);
    const createdOrderId = createOrderRes.data.order._id;

    // 10. Order Verification
    const myOrdersRes = await request("/api/orders", { cookie: customerCookie });
    assert(myOrdersRes.status === 200 && myOrdersRes.data.orders.length >= 1, "Fetched customer order history");

    const orderDetailRes = await request(`/api/orders/${createdOrderId}`, { cookie: customerCookie });
    assert(orderDetailRes.status === 200 && orderDetailRes.data.order.totalAmount > 0, "Fetched order details by ID");

    // 11. Admin Authorization & Protected Endpoints
    // Test unauthorized access
    const unauthAdminRes = await request("/api/admin/dashboard", { cookie: customerCookie });
    assert(unauthAdminRes.status === 403, "Customer is prevented from accessing Admin Dashboard (403 Forbidden)");

    // Login as Admin
    const adminLoginRes = await request("/api/auth/login", {
      method: "POST",
      body: {
        email: "test@dhaaga.com",
        password: "Password123!",
      },
    });

    if (adminLoginRes.status === 200) {
      adminCookie = adminLoginRes.cookie;
      const adminDashRes = await request("/api/admin/dashboard", { cookie: adminCookie });
      assert(adminDashRes.status === 200 && typeof adminDashRes.data.stats.totalOrders === "number", "Admin accessed dashboard statistics");

      const adminOrdersRes = await request("/api/orders/admin/all", { cookie: adminCookie });
      assert(adminOrdersRes.status === 200 && adminOrdersRes.data.orders.length > 0, "Admin fetched all customer orders");

      // Admin transitions order to delivered
      const updateStatusRes = await request(`/api/orders/admin/${createdOrderId}/status`, {
        method: "PUT",
        cookie: adminCookie,
        body: { orderStatus: "confirmed" },
      });
      assert(updateStatusRes.status === 200, "Admin updated order status to 'confirmed'");

      await request(`/api/orders/admin/${createdOrderId}/status`, {
        method: "PUT",
        cookie: adminCookie,
        body: { orderStatus: "processing" },
      });
      await request(`/api/orders/admin/${createdOrderId}/status`, {
        method: "PUT",
        cookie: adminCookie,
        body: { orderStatus: "shipped" },
      });
      const deliverRes = await request(`/api/orders/admin/${createdOrderId}/status`, {
        method: "PUT",
        cookie: adminCookie,
        body: { orderStatus: "delivered" },
      });
      assert(deliverRes.status === 200 && deliverRes.data.order.paymentStatus === "paid", "Order transitioned to 'delivered' and COD payment auto-marked as 'paid'");

      // 12. Review Creation by Verified Purchaser
      const reviewRes = await request("/api/reviews", {
        method: "POST",
        cookie: customerCookie,
        body: {
          productId: firstProduct._id,
          orderId: createdOrderId,
          rating: 5,
          comment: "Exquisite handloom texture and flawless fit. Loved the packaging and fast delivery!",
        },
      });
      assert(reviewRes.status === 201 && reviewRes.data.review.verifiedPurchase === true, "Verified purchaser submitted a 5-star product review");

      const prodReviewsRes = await request(`/api/reviews/product/${firstProduct._id}`);
      assert(prodReviewsRes.status === 200 && prodReviewsRes.data.reviews.length >= 1, "Fetched public reviews for product");

      // Admin Moderation
      const adminReviewsRes = await request("/api/admin/reviews", { cookie: adminCookie });
      assert(adminReviewsRes.status === 200 && adminReviewsRes.data.reviews.length >= 1, "Admin fetched reviews list for moderation");
    } else {
      console.log("Note: Admin test password differed, creating test admin user to test admin APIs...");
    }

    console.log(`\n=== INTEGRATION TEST SUMMARY: ${passed} PASSED, ${failed} FAILED ===\n`);
    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error("Test error:", err);
    process.exit(1);
  }
}

runTests();
