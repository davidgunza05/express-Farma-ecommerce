const cron = require('node-cron')
const orderCLTN = require("../../models/user/orders");
const moment = require("moment");
const UserCLTN = require("../../models/user/details");
const productCLTN = require("../../models/admin/product");
const contactCLTN = require('../../models/farmacia/contacto')
moment.locale('pt-br');

exports.view = async (req, res) => {
  try {
    const recentOrders = await orderCLTN.find().sort({ _id: -1 }).populate({ path: "customer", select: "email" });
    const orderCount = recentOrders.length;
    const customerCount = await UserCLTN.countDocuments();
    const productCount = await productCLTN.countDocuments();
    
    const allProducts = await productCLTN.find({})

    //Data de expiração 
    //referenceNumber é a data de expiração
    // função para notificar o admin sobre produtos que estão próximos da expiração
    const notiicarAdmin = async () => {
      // buscar todos os produtos com data de expiração dentro de uma semana
      const oneWeekFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      const expiringProducts = await productCLTN.find({
        expiryDate: { $lte: oneWeekFromNow }
      }).populate('category');
    
      // notificar o admin sobre os produtos encontrados
      if (expiringProducts.length > 0) {
        req.flash('error_msg', `Encontrados ${expiringProducts.length} produtos próximos da expiração.`)
        res.redirect('/admin/dashboard')
        console.log('Alguns produtos vão expirar em breve')
        // enviar uma notificação por e-mail, mensagem ou outro meio de comunicação para o admin
      }
    };
    // agendar a execução da verificação a cada dia às 9h da manhã
    cron.schedule('0 9 * * *', notiicarAdmin);
    

   var totalRevenue
    if (customerCount) {
       totalRevenue = await orderCLTN.aggregate([
        {
          $group: {
            _id: 0,
            totalRevenue: { $sum: "$finalPrice" },
          },
        },
      ]);
      if (totalRevenue) {
        totalRevenue = totalRevenue[0].totalRevenue;
      }
    } else {
      totalRevenue = 0;
    }

    const contacts = await contactCLTN.find({}).limit(3).sort({ _id: -1 })
    const contEmail = await contactCLTN.countDocuments()


    const currentDate = new Date();
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  
    orderCLTN.aggregate([
      {
        $match: {
          orderedOn: {
            $gte: startOfMonth,
            $lte: endOfMonth
          },
          delivered: true
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$finalPrice" }
        }
      }
    ])
    .exec((err, result) => {
      if (err) {
        console.error(err);
        return;
      }
      const vendaDesteMes = result.length > 0 ? result[0].totalRevenue : 0;
  
      // Renderizar o valor total arrecadado usando o EJS
      res.render("admin/partials/dashboard", {
        session: req.session.admin,
        recentOrders,
        moment,
        totalRevenue,
        orderCount,
        customerCount,
        productCount, 
        contEmail,
        allProducts,
        vendaDesteMes,
        //totalRevenue,
        details: contacts,
        documentTitle: 'Painel Admin'
      });
    }); 


  } catch (error) {
    console.log("Erro ao renderizar dashboard: " + error);
  }
};

exports.chartData = async (req, res) => {
  try {
    let currentYear = new Date();
    currentYear = currentYear.getFullYear();
    const orderData = await orderCLTN.aggregate([
      {
        
        $project: {
          _id: 0,
          totalProducts: "$totalQuantity",
          billAmount: "$finalPrice",
          month: {
            $month: "$orderedOn",
          },
          year: {
            $year: "$orderedOn",
          },
        },
      },
      
      {
        $group: {
          _id: { month: "$month", year: "$year" },
          totalProducts: { $sum: "$totalProducts" },
          totalOrders: { $sum: 1 },
          revenue: {
            $sum: "$billAmount",
          },
          avgBillPerOrder: {
            $avg: "$billAmount",
          },
        },
      },
      {
        $match: {
          "_id.year": currentYear,
        },
      },
      {
        $sort: { "_id.month": 1 },
      },
    ]);

    const dailyOrderData = await orderCLTN.aggregate([
      {
        $project: {
          _id: 0,
          totalProducts: "$totalQuantity",
          billAmount: "$finalPrice",
          month: {
            $month: "$orderedOn",
          },
          year: {
            $year: "$orderedOn",
          },
          day: {
            $dayOfMonth: "$orderedOn",
          },
          week: {
            $isoWeek: "$orderedOn",
          },
          product: "$products",
        },
      },
      {
        $group: {
          _id: { month: "$month", year: "$year", day: "$day" },
          totalProducts: { $sum: "$totalProducts" },
          totalOrders: { $sum: 1 },
          revenue: {
            $sum: "$billAmount",
          },
          avgBillPerOrder: {
            $avg: "$billAmount",
          },
        },
      },
      {
        $match: {
          "_id.year": currentYear,
        },
      },
      {
        $sort: { "_id.month": 1, "_id.day": 1 },
      },
    ]);
 
    const deliveredOrderes = await orderCLTN
      .find({ delivered: true })
      .countDocuments();
    let notDelivered = await orderCLTN.aggregate([
      {
        $match: {
          delivered: false,
        },
      },
      {
        $group: {
          _id: "$status",
          status: { $sum: 1 },
        },
      },
    ]);
    let inTransit;
    let cancelled;
    notDelivered.forEach((order) => {
      if (order._id === "Processando") {
        inTransit = order.status;
      } else if (order._id === "Cancelled") {
        cancelled = order.status;
      }
    });
    const delivered = deliveredOrderes;
    res.json({
      data: { orderData, inTransit, cancelled, delivered },
    });
  } catch (error) {
    console.log("Erro ao criar dados do gráficos 1: " + error);
  }
};


exports.OrderData = async (req, res) => {
  try {
    let currentYear = new Date();
    currentYear = currentYear.getFullYear();
    const orderData = await orderCLTN.aggregate([
      {
        
        $project: {
          _id: 0,
          totalProducts: "$totalQuantity",
          billAmount: "$finalPrice",
          month: {
            $month: "$orderedOn",
          },
          year: {
            $year: "$orderedOn",
          },
        },
      },
      
      {
        $group: {
          _id: { month: "$month", year: "$year" },
          totalProducts: { $sum: "$totalProducts" },
          totalOrders: { $sum: 1 },
          revenue: {
            $sum: "$billAmount",
          },
          avgBillPerOrder: {
            $avg: "$billAmount",
          },
        },
      },
      {
        $match: {
          "_id.year": currentYear,
        },
      },
      {
        $sort: { "_id.month": 1 },
      },
    ]);

    const dailyOrderData = await orderCLTN.aggregate([
      {
        $project: {
          _id: 0,
          totalProducts: "$totalQuantity",
          billAmount: "$finalPrice",
          month: {
            $month: "$orderedOn",
          },
          year: {
            $year: "$orderedOn",
          },
          day: {
            $dayOfMonth: "$orderedOn",
          },
          week: {
            $isoWeek: "$orderedOn",
          },
          product: "$products",
        },
      },
      {
        $group: {
          _id: { month: "$month", year: "$year", day: "$day" },
          totalProducts: { $sum: "$totalProducts" },
          totalOrders: { $sum: 1 },
          revenue: {
            $sum: "$billAmount",
          },
          avgBillPerOrder: {
            $avg: "$billAmount",
          },
        },
      },
      {
        $match: {
          "_id.year": currentYear,
        },
      },
      {
        $sort: { "_id.month": 1, "_id.day": 1 },
      },
    ]);

    
 
    const deliveredOrderes = await orderCLTN
      .find({ delivered: true })
      .countDocuments();
    let notDelivered = await orderCLTN.aggregate([
      {
        $match: {
          delivered: false,
        },
      },
      {
        $group: {
          _id: "$status",
          status: { $sum: 1 },
        },
      },
    ]);
    let inTransit;
    let cancelled;
    notDelivered.forEach((order) => {
      if (order._id === "Processando") {
        inTransit = order.status;
      } else if (order._id === "Cancelled") {
        cancelled = order.status;
      }
    });
    const delivered = deliveredOrderes;
    res.render('admin/relatorios/total', { orderData, inTransit, cancelled, delivered, dailyOrderData, documentTitle: 'Relatórios de venda',});
    
  } catch (error) {
    console.log("Erro ao criar dados do gráfico 2: " + error);
  }
};


exports.mostSoldProducts = async (req, res) => {
  try {
    const mostSoldDaily = await orderCLTN.aggregate([
      {
        $unwind: "$summary",
      },
      {
        $project: {
          _id: 0,
          month: { $month: "$orderedOn" },
          day: { $dayOfMonth: "$orderedOn" },
          product: "$summary.product",
          quantity: "$summary.quantity",
        },
      },
      {
        $group: {
          _id: { month: "$month", day: "$day", product: "$product" },
          quantity: { $sum: "$quantity" },
        },
      },
      {
        $sort: { "_id.month": 1, "_id.day": 1, quantity: -1 },
      },
      {
        $group: {
          _id: { month: "$_id.month", day: "$_id.day" },
          products: {
            $push: { product: "$_id.product", quantity: "$quantity" },
          },
        },
      },
    ]);

    const mostSoldMonthly = await orderCLTN.aggregate([
      {
        $unwind: "$summary",
      },
      {
        $project: {
          _id: 0,
          month: { $month: "$orderedOn" },
          product: "$summary.product",
          name: "$summary.name",
          quantity: "$summary.quantity",
        },
      },
      {
        $group: {
          _id: { month: "$month", product: "$product", name: "$name" },
          quantity: { $sum: "$quantity" },
        },
      },
      {
        $sort: { "_id.month": 1, quantity: -1 },
      },
      {
        $group: {
          _id: "$_id.month",
          products: {
            $push: { product: "$_id.product", quantity: "$quantity", name: "$name" },
          },
        },
      },
    ]);

    res.render("admin/relatorios/maisVendido", {
      mostSoldDaily,
      mostSoldMonthly,
      documentTitle: 'Relatórios de venda',
    });
  } catch (error) {
    console.log("Error retrieving most sold products: " + error);
  }
}; 

exports.Status = async (req, res) => {
  try {
    let currentYear = new Date();
    currentYear = currentYear.getFullYear();
    const orderData = await orderCLTN.aggregate([
      {
        
        $project: {
          _id: 0,
          totalProducts: "$totalQuantity",
          billAmount: "$finalPrice",
          month: {
            $month: "$orderedOn",
          },
          year: {
            $year: "$orderedOn",
          },
        },
      },
      
      {
        $group: {
          _id: { month: "$month", year: "$year" },
          totalProducts: { $sum: "$totalProducts" },
          totalOrders: { $sum: 1 },
          revenue: {
            $sum: "$billAmount",
          },
          avgBillPerOrder: {
            $avg: "$billAmount",
          },
        },
      },
      {
        $match: {
          "_id.year": currentYear,
        },
      },
      {
        $sort: { "_id.month": 1 },
      },
    ]);

    const dailyOrderData = await orderCLTN.aggregate([
      {
        $project: {
          _id: 0,
          totalProducts: "$totalQuantity",
          billAmount: "$finalPrice",
          month: {
            $month: "$orderedOn",
          },
          year: {
            $year: "$orderedOn",
          },
          day: {
            $dayOfMonth: "$orderedOn",
          },
          week: {
            $isoWeek: "$orderedOn",
          },
          product: "$products",
        },
      },
      {
        $group: {
          _id: { month: "$month", year: "$year", day: "$day" },
          totalProducts: { $sum: "$totalProducts" },
          totalOrders: { $sum: 1 },
          revenue: {
            $sum: "$billAmount",
          },
          avgBillPerOrder: {
            $avg: "$billAmount",
          },
        },
      },
      {
        $match: {
          "_id.year": currentYear,
        },
      },
      {
        $sort: { "_id.month": 1, "_id.day": 1 },
      },
    ]);
 
    const deliveredOrderes = await orderCLTN
      .find({ delivered: true })
      .countDocuments();
    let notDelivered = await orderCLTN.aggregate([
      {
        $match: {
          delivered: false,
        },
      },
      {
        $group: {
          _id: "$status",
          status: { $sum: 1 },
        },
      },
    ]);
    let inTransit;
    let cancelled;
    notDelivered.forEach((order) => {
      if (order._id === "Processando") {
        inTransit = order.status;
      } else if (order._id === "Cancelled") {
        cancelled = order.status;
      }
    });
    const delivered = deliveredOrderes;
    res.render('admin/relatorios/status', { orderData, inTransit, cancelled, delivered, dailyOrderData, documentTitle: 'Relatórios de venda',});
    
  } catch (error) {
    console.log("Erro ao criar dados do gráfico 3: " + error);
  }
};
 
exports.CustomersSold = async (req, res) =>{
// arquivo que usa o código anterior

orderCLTN.aggregate([
  {
    $group: {
      _id: "$customer",
      totalSpent: { $sum: "$finalPrice" },
      totalQuantity: { $sum: "$totalQuantity" },
    },
  },
  {
    $lookup: {
      from: "userdetails",
      localField: "_id",
      foreignField: "_id",
      as: "user",
    },
  },
  {
    $unwind: "$user",
  },
  {
    $sort: {
      totalSpent: -1,
    },
  },
  {
    $limit: 10,
  },
])
  .then((results) => {
    console.log(results);
    res.render("admin/relatorios/porCliente", { results: results, documentTitle: 'Relatórios de venda',});
  })
  .catch((error) => {
    console.log(error);
    // tratar o erro
  });

}