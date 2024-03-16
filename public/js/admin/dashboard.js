$.ajax({
  url: "/admin/dashboard",
  method: "PUT",
  success: (res) => {
    var orderData = res.data.orderData;
    let totalOrders = [];
    let revenuePerMonth = [];
    let avgBillPerOrder = [];
    let productsPerMonth = [];
    orderData.forEach((order) => {
      totalOrders.push(order.totalOrders);
      revenuePerMonth.push(order.revenue);
      avgBillPerOrder.push(order.avgBillPerOrder);
      productsPerMonth.push(order.totalProducts);
    });
    const ctx = document.getElementById("myChart");
    new Chart(ctx, {
      type: "bar",
      data: {
        labels: [
          "Mai",
          "Jun",
          "Jul",
          "Ago",
          "Set",
          "Out",
          "Nov",
          "Dez",
          "Jan",
          "Fev",
          "Mar",
          "Abr",
        ],
        datasets: [
          {
            label: "Receita",
            data: revenuePerMonth,
            borderWidth: 1,
            backgroundColor: "#fe7096",
            borderColor: "#d44d72",
          },
          {
            label: "Receita média por pedido",
            data: avgBillPerOrder,
            borderWidth: 1,
            backgroundColor: "#ffbb96",
            borderColor: "#e8996f",
          },
        ],
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });

    const inTransit = res.data.inTransit;
    const cancelled = res.data.cancelled;
    const delivered = res.data.delivered;
    const ctz = document.getElementById("myChart3");
    new Chart(ctz, {
      type: "doughnut",
      data: {
        labels: ["Processando", "Concluído", "Cancelado"],
        datasets: [
          {
            label: "Estado de compra",
            data: [inTransit, delivered, cancelled],

            backgroundColor: [
              "rgb(255, 205, 86,0.9)",
              "rgb(34,139,34,0.9)",
              "rgb(255,80,66,0.9)",
            ],
            hoverOffset: 10,
          },
        ],
      },
      options: {
        scales: {
          xAxes: [
            {
              gridLines: {
                display: false,
              },
            },
          ],
          yAxes: [
            {
              gridLines: {
                display: false,
              },
            },
          ],
        },
      },
    });

    const cty = document.getElementById("myChart2");
    new Chart(cty, {
      type: "bar",
      data: {
        labels: [
          "Mai",
          "Jun",
          "Jul",
          "Ago",
          "Set",
          "Out",
          "Nov",
          "Dez",
          "Jan",
          "Fev",
          "Mar",
          "Abr",
        ],
        datasets: [
          {
            label: "Compras",
            data: totalOrders,
            borderWidth: 1,

            backgroundColor: "#41d8c0",
            borderColor: "#22b19a",
          },
          {
            label: "Produtos vendidos",
            data: productsPerMonth,
            borderWidth: 1,
            backgroundColor: "#48a1e9",
            borderColor: "#3085c9",
          },
        ],
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });
  },
});

$(function () {
  $("#dataTable").DataTable({
    rowReorder: {
      selector: "td:nth-child(2)",
    },
    responsive: true,
  });
  new $.fn.dataTable.FixedHeader(table);
});
