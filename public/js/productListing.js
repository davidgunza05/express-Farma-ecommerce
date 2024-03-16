function sortBy(order) {
  $.ajax({
    url: "/products",
    method: "post",
    data: { sortBy: order },
    success: (res) => {
      if (res.message === "sorted") {
        Swal.fire({
          toast: true,
          icon: "success",
          position: "top-right",
          showConfirmButton: false,
          timer: 500,
          animation: true,
          title: "Sorted",
        });
        $("#productContainer").load(location.href + " #productContainer");
      }
    },
  });
}
function search() {
  var searchInput = $("#searchInput").val();
  if (searchInput) {
    $("#searchButton").html(
      `<button class="btn btn-sm" onclick="filter('none')" >Remove Filter</button>`
    );
  }
  $.ajax({
    url: "/products",
    method: "put",
    data: { searchInput: searchInput },
    success: (res) => {
      $("#productContainer").load(location.href + " #productContainer");
    },
  });
}
function filter(filterBy) {
  $.ajax({
    url: "/products",
    type: "patch",
    data: { filterBy: filterBy },
    success: (res) => {
      Swal.fire({
        toast: true,
        icon: "success",
        position: "top-right",
        showConfirmButton: false,
        timer: 500,
        animation: true,
        title: "Filtered",
      });
      $("#productContainer").load(location.href + " #productContainer");
      if (res.success == 0) {
        $("#searchInput").val("");
      }
    },
  });
}
function removeFilter(filterBy) {
  $.ajax({
    url: "/products",
    type: "patch",
    data: { filterBy: filterBy },
    success: (res) => {
      $("#productContainer").load(location.href + " #productContainer");
      $("#searchButton").load(location.href + " #searchButton");
    },
  });
}

if (window.history.replaceState) {
  window.history.replaceState(null, null, window.location.href);
}
