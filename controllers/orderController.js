const Order = require('../models/Order');

// @desc    Get all orders
// @route   GET /api/orders
// @access  Public
const getAllOrders = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      search,
      action,
      status,
      orderType
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (search) {
      filter.$or = [
        { customerName: { $regex: search, $options: 'i' } },
        { trackingId: { $regex: search, $options: 'i' } },
        { customerEmail: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (action) {
      filter.action = action;
    }
    
    if (status) {
      filter.status = status;
    }
    
    if (orderType) {
      filter.orderType = orderType;
    }

    // Calculate pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const orders = await Order.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limitNum);

    const total = await Order.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: orders.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      data: orders
    });
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving orders',
      error: error.message
    });
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Public
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Get order by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving order',
      error: error.message
    });
  }
};

// @desc    Get order by tracking ID
// @route   GET /api/orders/track/:trackingId
// @access  Public
const getOrderByTrackingId = async (req, res) => {
  try {
    const order = await Order.findOne({ trackingId: req.params.trackingId });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found with this tracking ID'
      });
    }

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Get order by tracking ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving order',
      error: error.message
    });
  }
};

// @desc    Create new order
// @route   POST /api/orders
// @access  Public
const createOrder = async (req, res) => {
  try {
    const {
      customerName,
      orderDate,
      orderType,
      trackingId,
      orderTotal,
      action,
      status,
      description,
      customerEmail,
      customerPhone,
      shippingAddress
    } = req.body;

    // Validate required fields
    if (!customerName || !orderTotal) {
      return res.status(400).json({
        success: false,
        message: 'Customer name and order total are required'
      });
    }

    const orderData = {
      customerName,
      orderDate: orderDate || new Date(),
      orderType: orderType || 'online',
      trackingId,
      orderTotal,
      action: action || 'pending',
      status: status || 'active',
      description,
      customerEmail,
      customerPhone,
      shippingAddress
    };

    const order = await Order.create(orderData);

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: order
    });
  } catch (error) {
    console.error('Create order error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Tracking ID already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error creating order',
      error: error.message
    });
  }
};

// @desc    Update order
// @route   PUT /api/orders/:id
// @access  Public
const updateOrder = async (req, res) => {
  try {
    const {
      customerName,
      orderDate,
      orderType,
      trackingId,
      orderTotal,
      action,
      status,
      description,
      customerEmail,
      customerPhone,
      shippingAddress
    } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Update fields
    if (customerName) order.customerName = customerName;
    if (orderDate) order.orderDate = orderDate;
    if (orderType) order.orderType = orderType;
    if (trackingId) order.trackingId = trackingId;
    if (orderTotal !== undefined) order.orderTotal = orderTotal;
    if (action) order.action = action;
    if (status) order.status = status;
    if (description !== undefined) order.description = description;
    if (customerEmail !== undefined) order.customerEmail = customerEmail;
    if (customerPhone !== undefined) order.customerPhone = customerPhone;
    if (shippingAddress) order.shippingAddress = shippingAddress;

    const updatedOrder = await order.save();

    res.status(200).json({
      success: true,
      message: 'Order updated successfully',
      data: updatedOrder
    });
  } catch (error) {
    console.error('Update order error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Tracking ID already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error updating order',
      error: error.message
    });
  }
};

// @desc    Delete order
// @route   DELETE /api/orders/:id
// @access  Public
const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    await Order.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Order deleted successfully'
    });
  } catch (error) {
    console.error('Delete order error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting order',
      error: error.message
    });
  }
};

// @desc    Update order action
// @route   PATCH /api/orders/:id/action
// @access  Public
const updateOrderAction = async (req, res) => {
  try {
    const { action } = req.body;

    if (!action) {
      return res.status(400).json({
        success: false,
        message: 'Action is required'
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    order.action = action;
    const updatedOrder = await order.save();

    res.status(200).json({
      success: true,
      message: 'Order action updated successfully',
      data: updatedOrder
    });
  } catch (error) {
    console.error('Update order action error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating order action',
      error: error.message
    });
  }
};

// @desc    Update order status
// @route   PATCH /api/orders/:id/status
// @access  Public
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    order.status = status;
    const updatedOrder = await order.save();

    res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      data: updatedOrder
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating order status',
      error: error.message
    });
  }
};

module.exports = {
  getAllOrders,
  getOrderById,
  getOrderByTrackingId,
  createOrder,
  updateOrder,
  deleteOrder,
  updateOrderAction,
  updateOrderStatus
};
