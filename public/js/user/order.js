function cancelOrder(orderId) {

  Swal.fire({
    text: "Pretende cancelar esta compra?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Sim",
  }).then((result) => {
    if (result.isConfirmed) {
      $.ajax({
        url: "/users/orders/" + orderId,
        method: "patch",
        success: (res) => {
          if (res.success === "cancelled") {
            $("#orderDetails").load(location.href + " #orderDetails"); 
          }
        },
      });
    }
  }); 
}

function printInvoice(divName) {
  var printContents = document.getElementById(divName).innerHTML;
  var originalContents = document.body.innerHTML;

  document.body.innerHTML = printContents;

  window.print();

  document.body.innerHTML = originalContents;
} 

/*
import jsPDF from 'jspdf';
function printInvoice() {
  const divName = document.getElementById(divName).innerHTML;
  const pdf = new jsPDF();
  pdf.fromHTML(divName, 15, 15, {
    width: 170
  });
  pdf.save('fatura_de_compra.pdf');
}
*/