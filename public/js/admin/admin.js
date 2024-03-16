// Orders
function deliverOrder(id, i) {
  $.ajax({
    url: "/admin/orders",
    type: "patch",
    data: {
      orderID: id,
    },
    success: (res) => {
      if (res.data.delivered === 1) {
        $("#deliver" + i).load(location.href + " #deliver" + i);
      }
    },
  });
}

function printInvoice(divName) {
  var printContents = document.getElementById(divName).innerHTML;
  var originalContents = document.body.innerHTML;

  document.body.innerHTML = printContents;

  window.print();

  document.body.innerHTML = originalContents;
}

// Customers
function changeAccess(id, access) {
  $.ajax({
    url: "/admin/customer_management",
    type: "patch",
    data: {
      userID: id,
      currentAccess: access,
    },
    success: (res) => {
      $("#" + id).load(location.href + " #" + id);
    },
  });
}

// Banners
function deleteBanner(id) {
  $.ajax({
    url: "/admin/banner_management",
    type: "delete",
    data: {
      bannerID: id,
    },
    success: (res) => {
      $("#allBanners").load(location.href + " #allBanners");
    },
  });
}
function changeActivity(id, active) {
  $.ajax({
    url: "/admin/banner_management",
    type: "patch",
    data: {
      bannerID: id,
      currentActivity: active,
    },
    success: (res) => {
      $("#Action" + id).load(location.href + " #Action" + id);
    },
  });
}
