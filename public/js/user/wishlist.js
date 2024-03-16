function removeFromWishlist(id) {
  Swal.fire({
    text: "Remover da lista de desejos?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Sim",
  }).then((result) => {
    if (result.isConfirmed) {
      $.ajax({
        url: "/users/wishlist/",
        method: "delete", 
        data: {
          productID: id,
        },
        success: (res) => {
          if (res.data.deleted) {
            $("#wishlist").load(location.href + " #wishlist");
          }
        },
      });
    }
  });
}
function addToCartFromWishlist(productID) {
  Swal.fire({
    text: "Adicionar este produto ao carrinho?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes",
  }).then((result) => {
    if (result.isConfirmed) {
      $.ajax({
        url: "/users/cart",
        method: "post",
        data: {
          id: productID,
        },
        success: (res) => {
          if (res.success === "addedToCart" || res.success === "countAdded") { 
            $("#wishlist").load(location.href + " #wishlist");
          } else {
            window.location.href = "/users/signIn";
          }
        },
      });
    }
  });
}
