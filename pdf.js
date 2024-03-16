
const pdfMake = require('pdfmake');
const fs = require('fs');

const orderCLTN = require("../models/user/orders");
const moment = require("moment");
moment.locale('pt-br');

// Define a route for generating the PDF
router.get('/download', (req, res) => {
  // Retrieve the order data from the database
  const currentOrder = orderCLTN.findById(req.params.id).populate("summary.product").populate("couponUsed").populate("customer", "name email")

  // Create the document definition for PDF generation
  const docDefinition = {
    content: [
  `<div class="container-xxl flex-grow-1 container-p-y pb-5"> 
<%- include('../layouts/msg') %> 
  <div class="row">
    <div class="col-12 grid-margin">
      <div class="card">
        <div class="card-body">
          <div class="container bg-white">
            <div class="row mb-2 mt-4 rounded border p-3" id="compra">
              <div class="col-lg-10 mx-auto">
                  <a class="navbar-brand d-flex align-items-center justify-content-center mt-2 mb-4" href="#">
                      <img src="/img/timeless-logo.png" alt="Logo" width="40" height="40" class="d-inline-block align-text-top"/>
                      <div class="brand-name ms-3">
                        <span>e-Farma</span>
                      </div>
                    </a>
                  <div class="name mb-2 row" style="border-bottom: 1px solid #dbdbdb; font-size: 0.8rem;">
                      <span class="col-lg-6 my-1">ID do pedido: <%=currentOrder._id%></span>
                      <span class="col-lg-6 my-1">Pedido em: <%=moment(currentOrder.orderedOn).format('LLL')%></span>
                  </div>
                <div class="user-details my-3">
                  <h6 class="border-bottom pb-2">Produtos:</h6>
                <% if(currentOrder.summary != null){ %>
                  <%currentOrder.summary.forEach((product,i)=> {%>
                <div class="product-details d-flex justify-content-between pb-1 px-5" style="border-bottom: 1px solid #dbdbdb" >
                  <span><%=i+1%>.</span>

                  <span class="flex-grow-1 mx-3"><%=product.product.name%></span>
                  <span><span style="text-transform: none;">x</span> <%=product.quantity%></span>
                  <span class="mx-5"><%=product.totalPrice%> AKZ</span>
                </div>
                <%})%>
                <%}%>
              </div> 
          
              <div class="address my-2 pt-3">
                  <h6>Endereço para entrega:</h6>
                  <% if(currentOrder.shippingAddress!=""){ %>
                    <p class="px-1" style="text-transform: none;">
                      Província: <%=currentOrder.shippingAddress.provincia%><br>
                      Município / Distrito: <%=currentOrder.shippingAddress.municipio%><br>
                      Bairro / Outro: <%=currentOrder.shippingAddress.bairro%> <br>
                      Prédio: <%=currentOrder.shippingAddress.predio%> - Casa / Aprt Nº: <%=currentOrder.shippingAddress.pincode%></br>
                      Contacto:  <%=currentOrder.shippingAddress.contacto%></br></p>
                  <%}%>
              </div> 
          
              
              <div class="pt-3 pb-3" style="border-bottom: 1px solid #dbdbdb; border-top: 1px solid #dbdbdb">
                <b>Nome do cliente:</b> <%= currentOrder.customer.name%> <br>
                <b>Email do cliente:</b> <%= currentOrder.customer.email%> <br>
              </div>

            <div class="">
              <div class="row my-2 line-break p-1">
                <div class="col-lg-6 my-2 px-3">
                    <span class="d-flex justify-content-between">
                        <h6>
                            Quantidade total: 
                        </h6>
                        <span>
                            <%=currentOrder.totalQuantity%>
                        </span>
                    </span>
                    <span class="d-flex justify-content-between">
                        <h6>
                            Forma de pagamento:
                        </h6>
                        <span>
                            <%=currentOrder.modeOfPayment%>
                        </span>
                    </span>
                    <span class="d-flex justify-content-between">
                        <h6>
                            Desconto usuado:
                        </h6>
                        <span>
                            <%if(currentOrder.couponUsed){%> <%=currentOrder.couponUsed.name%> <%}else{%> Nenhum desconto usado<%}%>
                        </span>
                    </span>
                </div>
                <div class="col-lg-6 my-2 px-3">
                    <span class="d-flex justify-content-between">
                        <h6>
                            Preço:
                        </h6>
                        <span>
                            <%=currentOrder.price%> AKZ
                        </span>
                    </span>
                    <span class="d-flex justify-content-between">
                        <h6>
                            Preço com desconto:
                        </h6>
                        <span>
                            <%=currentOrder.discountPrice%> AKZ
                        </span>
                    </span>
                    <span class="d-flex justify-content-between">
                        <h6>
                            Preço final:
                        </h6>
                        <span>
                            <%=currentOrder.finalPrice%> AKZ
                        </span>
                    </span>
                </div>
        
              </div>
              <div class="form-footer py-0 row justify-content-between">
                <span class="col-lg-8 my-1" style="font-weight: 500">Estado do Pedido: 
                  <%if(currentOrder.delivered==true){%>
                    <span class="text-success">Concluído</span> 
                    <%=moment(currentOrder.orderedOn).format('LLL')%>
                    <%}else{%>
                      <b><%=currentOrder.status%></b>
                    <%}%>
                  </span>
              </div>
            </div>
    
    
            </div>
            </div>
            <div class="d-flex justify-content-around mt-5" >
            <a href="/admin/orders" style="font-size: 0.7rem;" class="col-3 btn btn-dark d-flex align-items-center justify-content-center px-2 mb-3 text-white"
            ><i class="fa fa-arrow-left mx-1"></i> Voltar a todos pedidos</a
          > 
          <%if(currentOrder.status !== 'Cancelled'){%> <button style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 2.5px;" class="col-3 btn btn-danger d-flex align-items-center justify-content-center px-2 mb-3 text-white"
          onclick="cancelOrder('<%=currentOrder._id%>')">Cancelar pedido</button
          > <% }%>
          <form action="/download-pdf/<%=currentOrder._id%>" method="get" target="_blank">
            <button type="submit" class="col-3 btn btn-dark d-flex align-items-center justify-content-center px-2 mb-3 text-white">Baixar fatura</button>
          </form>
            </div>
          </div>
        </div>
      </div>
    </div> 

    </div>
</div>`
    ]
  };

  // Create a PDF document using pdfmake
  const printer = new pdfMake();
  const pdfDoc = printer.createPdfKitDocument(docDefinition);

  // Generate a unique filename for the PDF
  const filename = `order_${currentOrder._id}.pdf`;

  // Pipe the PDF document to a writable stream
  const stream = fs.createWriteStream(filename);
  pdfDoc.pipe(stream);

  // Once the PDF is generated, send the file as a response
  pdfDoc.end();
  stream.on('finish', () => {
    res.download(filename, err => {
      if (err) {
        // Handle any error that occurred during download
        console.error(err);
      }
      // Delete the generated PDF file
      fs.unlink(filename, () => {});
    });
  });
});

// Add the router to your Express application
app.use('/orders', router);
