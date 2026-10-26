import crypto from 'node:crypto';

const API_BASE = 'http://localhost:5000/api';

async function request(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  const json = await res.json().catch(() => ({}));
  return { status: res.status, ok: res.ok, body: json };
}

async function runAudit() {
  console.log('====================================================');
  console.log('   URBAN BITES — PHASE 6 COMPREHENSIVE SYSTEM AUDIT');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assertCheck(name, condition, extraInfo = '') {
    if (condition) {
      console.log(`[PASS] ${name}`);
      passed++;
    } else {
      console.error(`[FAIL] ${name} ${extraInfo}`);
      failed++;
    }
  }

  try {
    // 1. Health API Check
    const health = await request('/health');
    assertCheck('1. Backend Server Health (/api/health)', health.status === 200 && health.body.status === 'healthy');

    // 2. Menu API Check
    const menu = await request('/menu');
    assertCheck('2. Menu Listing (/api/menu)', menu.status === 200 && Array.isArray(menu.body.data) && menu.body.data.length > 0);
    const sampleDish = menu.body.data[0];
    assertCheck('   Authoritative Dish Structure (price, name, category)', Boolean(sampleDish && sampleDish.price > 0 && sampleDish.name));

    // 3. Payment Config Endpoint Check
    const payConfig = await request('/payment/config');
    assertCheck('3. Payment Config Status (/api/payment/config)', payConfig.status === 200 && payConfig.body.mode === 'test' && payConfig.body.currency === 'INR');

    // 4. Order Creation with Authoritative Price Recalculation
    const orderPayload = {
      customerName: 'Adil Khan',
      phone: '9876543210',
      email: 'adil@example.com',
      orderType: 'delivery',
      deliveryAddress: '42 Indiranagar 100ft Road, Bengaluru',
      notes: 'Please ring doorbell and leave with security',
      items: [
        { menuItemId: sampleDish._id, quantity: 2, price: 1 } // Intentionally sending manipulated price of 1
      ],
      paymentMethod: 'razorpay'
    };

    const orderRes = await request('/orders', {
      method: 'POST',
      body: JSON.stringify(orderPayload)
    });

    const expectedSubtotal = sampleDish.price * 2;
    const expectedDelivery = expectedSubtotal >= 799 ? 0 : 49;
    const expectedTax = Math.round(expectedSubtotal * 0.05);
    const expectedTotal = expectedSubtotal + expectedDelivery + expectedTax;

    assertCheck(
      '4. Server-Side Price Recalculation & Tamper Rejection',
      orderRes.status === 201 &&
      orderRes.body.data.subtotal === expectedSubtotal &&
      orderRes.body.data.total === expectedTotal,
      `(Expected Total ₹${expectedTotal}, got ₹${orderRes.body.data?.total})`
    );

    const createdOrder = orderRes.body.data;
    assertCheck('   Order Initialized as paymentStatus=pending, orderStatus=pending',
      createdOrder.paymentStatus === 'pending' && createdOrder.orderStatus === 'pending'
    );

    // 5. Razorpay Create Payment Order Endpoint
    const payOrderRes = await request('/payment/create-order', {
      method: 'POST',
      body: JSON.stringify({ orderId: createdOrder.orderId })
    });
    assertCheck(
      '5. Razorpay Payment Order Handler (/api/payment/create-order)',
      payOrderRes.status === 200 && (payOrderRes.body.amount === expectedTotal * 100 || payOrderRes.body.isConfigured === false)
    );

    // 6. Signature Tamper Rejection Check
    const tamperRes = await request('/payment/verify', {
      method: 'POST',
      body: JSON.stringify({
        orderId: createdOrder.orderId,
        razorpayOrderId: 'order_mock_test_123',
        razorpayPaymentId: 'pay_mock_test_456',
        razorpaySignature: 'tampered_fake_signature_hex_value'
      })
    });
    assertCheck('6. Cryptographic Tamper Signature Rejection (400)', tamperRes.status === 400 && tamperRes.body.success === false);

    // 7. Payment Failure/Cancellation Recording
    const failRes = await request('/payment/failure', {
      method: 'POST',
      body: JSON.stringify({
        orderId: createdOrder.orderId,
        reason: 'Modal cancelled by user'
      })
    });
    assertCheck('7. Payment Failure & Cancellation Logging (/api/payment/failure)', failRes.status === 200 && failRes.body.data.paymentStatus === 'failed');

    // 8. Switching Unpaid Order to Cash on Delivery (COD)
    const switchRes = await request('/payment/switch-to-cod', {
      method: 'POST',
      body: JSON.stringify({ orderId: createdOrder.orderId })
    });
    assertCheck(
      '8. Fallback Switch to COD & Confirm (/api/payment/switch-to-cod)',
      switchRes.status === 200 &&
      switchRes.body.data.paymentMethod === 'cod' &&
      switchRes.body.data.orderStatus === 'confirmed'
    );

    // 9. Table Reservation Workflow
    const resPayload = {
      customerName: 'Priya Verma',
      phone: '9988776655',
      email: 'priya@example.com',
      reservationDate: '2026-11-15',
      timeSlot: '07:30 PM',
      guests: 4,
      specialRequests: 'Window booth if available'
    };
    const resCreate = await request('/reservations', {
      method: 'POST',
      body: JSON.stringify(resPayload)
    });
    assertCheck('9. Table Reservation Creation (/api/reservations)', resCreate.status === 201 && Boolean(resCreate.body.data?.referenceCode));
    const refCode = resCreate.body.data?.referenceCode;

    const resLookup = await request(`/reservations/${refCode}`);
    assertCheck('   Reservation Reference Lookup Persistence', resLookup.status === 200 && resLookup.body.data?.customerName === 'Priya Verma');

    // 10. Admin Authentication & Protected Operations
    const adminPassword = process.env.INITIAL_ADMIN_PASSWORD || 'admin123';
    const adminLogin = await request('/admin/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'admin@urbanbites.com',
        password: adminPassword,
      })
    });
    assertCheck('10. Admin Authentication & JWT Generation (/api/admin/login)', adminLogin.status === 200 && Boolean(adminLogin.body.token));
    const token = adminLogin.body.token;

    // 11. Unauthorized Protection Check
    const unauthCheck = await request('/admin/stats');
    assertCheck('11. Protected Route Reject Missing Token (401)', unauthCheck.status === 401);

    // 12. Admin Stats with Valid JWT
    const statsRes = await request('/admin/stats', {
      headers: { Authorization: `Bearer ${token}` }
    });
    assertCheck('12. Admin Dashboard Metrics Retrieval with JWT', statsRes.status === 200 && statsRes.body.data.totalOrders >= 1);

    // 13. Admin Menu CRUD Operations
    const newDishRes = await request('/admin/menu', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        name: 'Audit Special Truffle Burger',
        description: 'Special dish created during Phase 6 automated audit',
        price: 499,
        category: 'Burgers',
        isVegetarian: false,
        isPopular: true,
        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80',
        tags: ['Gourmet', 'Truffle']
      })
    });
    assertCheck('13. Admin Create Menu Item (POST /api/admin/menu)', newDishRes.status === 201 && newDishRes.body.data.name === 'Audit Special Truffle Burger');
    const createdDishId = newDishRes.body.data._id;

    // Toggle availability
    const toggleRes = await request(`/admin/menu/${createdDishId}/availability`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ isAvailable: false })
    });
    assertCheck('   Admin Toggle Dish Availability to Sold Out (PATCH)', toggleRes.status === 200 && toggleRes.body.data.isAvailable === false);

    // Delete dish
    const deleteRes = await request(`/admin/menu/${createdDishId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    assertCheck('   Admin Delete Dish Cleanup (DELETE)', deleteRes.status === 200);

    console.log('\n====================================================');
    console.log(`AUDIT RESULTS: ${passed} passed, ${failed} failed`);
    console.log('====================================================');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Audit run encountered fatal error:', err);
    process.exit(1);
  }
}

runAudit();
