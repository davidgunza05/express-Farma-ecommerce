function reduceCount(productID, i) {
  $.ajax({
    url: "/users/cart/count",
    method: "delete",
    data: { id: productID },
    success: (res) => {
      $(`#cartCount${i}`).html(res.data.currentProduct.quantity);
      $(`#totalItems`).html(res.data.userCart.totalQuantity);
      $(`#totalPrice`).html(res.data.userCart.totalPrice + "AKZ");
    },
  });
}

function addCount(productID, i) {
  $.ajax({
    url: "/users/cart/count",
    method: "put",
    data: { id: productID },
    success: (res) => {
      $(`#cartCount${i}`).html(res.data.currentProduct.quantity);
      $(`#totalItems`).html(res.data.userCart.totalQuantity);
      $(`#totalPrice`).html(res.data.userCart.totalPrice + "AKZ");
    },
  });
}

function removeFromCart(productID) {
    Swal.fire({
      text: "Remover este produto do carrinho?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sim",
    }).then((result) => {
      if (result.isConfirmed) {
        $.ajax({
          url: "/users/cart",
          method: "delete",
          data: {
            id: productID,
          },
          success: (res) => {
            if (res.success === "removed") {
              $("#cart").load(location.href + " #cart"); 
            }
          },
        });
      }
  });
}
