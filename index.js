const express = require("express")
const mercadoPago = require("mercadopago")
const app = express()

mercadoPago.configure({ //configurações da biblioteca do mercado pago
    sandbox: true, //true: modo de desenvolvimento / false: modo de produção (pra valer)
    access_token: "TEST-699811808023491-051121-30a7bc7ae895b38e9fd838bc94fb5560-25273944" //para ter acesso à API
})

app.get("/", (req, res) =>{
    res.send("Olá mundo")
})

//rota para fazer um pagamento
app.get("/pagar", async (req, res) =>{
    /* tabela no bd: pagamentos
    id / código / pagador / status
    1 / 1265246 / ranny008@hotmail.com / não pago
    2 / 3657365 / rafa@hotmail.com / pago
    */
    var id = "" + Date.now()
    var emailDoPagador = "ranny008@gmail.com"

    var dados = { //obj para definir pagamentos
        items: [
            item = { //compra
                //biblioteca: UUID ou Date.now(): data-hora-min-seg-milis. sem id não consegue saber se o pagamento gerado foi pago ou não. O programador que define. Tem que ser diferente para cada venda
                id: id,
                title: "2 video games, 3 camisas", //descrição da venda
                quantity: 1, //quantidade. O preço total é multiplicado por esta quantidade. Por isso, se for vários produtos melhor deixar 1 e calcular o preço na função
                currency_id: 'BRL', //moeda
                unit_price: parseFloat(150) //preço: (em float) precisa calcular antes de passar

            }
        ],
        payer: { //pagador
            email: emailDoPagador
        },
        external_reference: id,
    }

    try{
        var pagamento = await mercadoPago.preferences.create(dados) //criar o pagamento
        //console.log(pagamento) //ver o que foi gerado
        //banco.salvarPagamento({id: id, pagador: emailDoPagador}) //se for trabalhar com bd
        return res.redirect(pagamento.body.init_point) //redirecionar o usuário para a URL de checkout
    }catch(err){
        return res.send(err.message)
    }
})

app.post("/not", (req, res) =>{
    var id = req.query.id
    setTimeout(() => {
        var filtro = {
            "order.id": id
        }

        mercadoPago.payment.search({
            qs: filtro
        }).then(data => {
            var pagamento = data.body.results[0]
            if(pagamento != undefined){
                console.log(pagamento)
                console.log(pagamento.external_reference)
                console.log(pagamento.status) //approved: sucesso
            }else{
                console.log("pagamento não existe!")
            }
            console.log(data)
        }).catch(err => {
            console.log(err)
        })
    },20000)
    res.send("ok") //resposta que recebeu a notificação
})

app.listen(80, (req, res) =>{ //porta 80: padrão da web
    console.log("Servidor rodando!")
})