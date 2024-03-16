function buyNow(productID) {
  $.ajax({
    url: "/users/cart",
    method: "post",
    data: {
      id: productID,
    },
    success: (res) => {
      console.log(res.success);
      if (res.success) {
        window.location.href = "/users/cart";
      } else {
        window.location.href = "/users/signIn";
      }
    },
  });
}
function addToCart(productID) {
  $.ajax({
    url: "/users/cart",
    method: "post",
    data: {
      id: productID,
    },
    success: (res) => {
      if (res.success === "countAdded") {
        Swal.fire({
          toast: true,
          icon: "success",
          position: "top-right",
          showConfirmButton: false,
          timer: 1000,
          timerProgressBar: true,
          animation: true,
          title: "Count added in cart",
        });
      } else if (res.success === "addedToCart") {
        Swal.fire({
          toast: true,
          icon: "success",
          position: "top-right",
          showConfirmButton: false,
          timer: 1000,
          timerProgressBar: true,
          animation: true,
          title: "Added to cart",
        });
      } else {
        window.location.href = "/users/signIn";
      }
    },
  });
}
window.onload = () => {
  let productID = window.location.pathname.split("/", 3).splice(2).toString();
  $.ajax({
    url: "/products/" + productID,
    method: "patch",
    data: {
      id: productID,
    },
    success: (res) => {
      if (res.message === "unlisted") {
        $("#addToCart").css("pointer-events", "none");
        $("#buyNow").css("pointer-events", "none");
        Swal.fire("Oops!", "Product currently unavailable.", "error");
      }
    },
  });
};
function reviewAdd() {
  Swal.fire({
    showCloseButton: true,
    showConfirmButton: true,
    html: `<form id="reviewForm">
<div class="mb-3">
  <label for="review" class="form-label">Post a review</label>
  <input name="review" class="form-control" id="review pattern='^[A-Z]{1,30}$" >
</div>
<input type="text" name="product" value='<%=productDetails._id%>' hidden>
<div class="mb-3">
  <div class="review-star">
    <input type="checkbox" name="rating" id="st1" value="5" />
    <label for="st1"></label>
    <input type="checkbox" name="rating" id="st2" value="4" />
    <label for="st2"></label>
    <input type="checkbox" name="rating" id="st3" value="3" />
    <label for="st3"></label>
    <input type="checkbox" name="rating" id="st4" value="2" />
    <label for="st4"></label>
    <input type="checkbox" name="rating" id="st5" value="1" />
    <label for="st5"></label>
  </div>
</div>
</form>`,
  }).then((result) => {
    if (result.isConfirmed) {
      $.ajax({
        url: "/users/reviews",
        method: "post",
        data: $("#reviewForm").serialize(),
        success: (res) => {
          $("section").load(location.href + " section");
          $("#addReview").hide();
        },
      });
    }
  });
}
function helpful(id) {
  $.ajax({
    url: "/users/reviews",
    method: "patch",
    data: {
      reviewID: id,
    },
    success: (res) => {
      if (res.success == 1) {
        $("#helpful" + id).load(location.href + " #helpful" + id);
      } else {
        window.location.replace("/users/signIn");
      }
    },
  });
}
function addToWishlist(productId) {
  $.ajax({
    url: "/users/wishlist",
    method: "patch",
    data: {
      id: productId,
    },
    success: (res) => {
      if (res.data.message === 0) {
        $("#wishlistHeart").html('<i class="fa fa-heart text-white">');
        Swal.fire({
          toast: true,
          icon: "error",
          position: "top-right",
          showConfirmButton: false,
          timer: 1000,
          timerProgressBar: true,
          animation: true,
          title: "Removed from wishlist",
        });
      } else if (res.data.message === 1) {
        $("#wishlistHeart").html('<i class="fa fa-heart text-danger">');
        Swal.fire({
          toast: true,
          icon: "success",
          position: "top-right",
          showConfirmButton: false,
          timer: 1000,
          timerProgressBar: true,
          animation: true,
          title: "Added to wishlist",
        });
      } else {
        window.location.href = "/users/signIn";
      }
    },
  });
}
