const http = require("http");
const url = require("url");
const express = require('express');
const fs = require("fs")
const path = require("path")

const porta = 8888
const app = express();
let prodotti = []

const bodyParser = require('body-parser');

app.use(bodyParser.json()); // to support JSON-encoded bodies

app.use(bodyParser.urlencoded({ extended: true }));


app.use(express.static('./public'));

let content = fs.readFileSync("./prod.json", "UTF8")

prodotti = JSON.parse(content)


// pagina indice  
app.get('/', function (req, res) {
    res.sendFile('./public/index.html', { root: __dirname });
    res.end()
});


// elenco prodotti per categoria
app.get('/prodottipercategoria/:cat', function (req, res) {

    res.set({ 'content-type': 'text/html; charset=utf-8' });
    var catcercata = req.params.cat


    let ris = prodotti.filter(p => { return p.categoria == catcercata })

    if (ris.length > 0)
        res.status(200).end(JSON.stringify(ris));
    else
        res.status(400).end([]);

});




// elenco prodotti  
app.get('/prodotti', function (req, res) {


    res.set({ 'content-type': 'text/html; charset=utf-8' });

    res.status(202)
    res.end(JSON.stringify(prodotti));

});

// elenco categorie  
app.get('/categorie', function (req, res) {

    let categorie = [...new Set(prodotti.map(p => p.categoria))]

    res.set({ 'content-type': 'text/html; charset=utf-8' });

    res.status(200).end(JSON.stringify(categorie));

});


//scheda prodotto dato l'id
app.get('/prodotto/:id', function (req, res) {

    res.set({ 'content-type': 'text/html; charset=utf-8' });

    let idprodotto = req.params.id

    let prodottocercato = prodotti.filter(p => { return p.id == idprodotto })

    if (prodottocercato.length >= 1)
        res.end(JSON.stringify(prodottocercato[0]));
    else
        res.status(404).end(JSON.stringify("prodotto non trovato"));

});


// gli n prodotti più costosi     
app.get('/top/:n', function (req, res) {

    let N = req.params.n

    res.set({ 'content-type': 'text/html; charset=utf-8' });

    var topN = prodotti.sort((a, b) => { return b.prezzo - a.prezzo }).slice(0, N)



    res.status(200).end(JSON.stringify(topN));

});


// aggiungere un prodotto

app.post('/aggiungi', function (req, res) {

    let prezzo = req.body.prezzo * 1
    let descrizione = req.body.descrizione
    let categoria = req.body.categoria
 
    let idm = Math.max(...prodotti.map(p => p.id * 1))

    let nuovo = { id: idm + 1, descrizione: descrizione, prezzo: prezzo, categoria: categoria }

    prodotti.push(nuovo)

    res.status(201).send("aggiunto prodotto!")

});

// aggiornare il prezzo di un prodotto 1° modo


app.put('/aggiorna', function (req, res) {

    let prod = req.body.idprodotto
    let nuovoprezzo = req.body.prezzo
    let modif = false

    prodotti.forEach(p => { if (p.id == prod) { } p.prezzo = nuovoprezzo; modif = true })

    //    let prodotto=prodotti.filter(p=>{return p.id==prod})[0]

    if (modif)
        res.status(200).end("prodotto aggiornato!");
    else
        res.status(400).end("prodotto non esistente");


});

// aggiornare il prezzo di un prodotto 2° modo   

app.put('/aggiorna/:idprodotto/:prezzo', function (req, res) {



    res.set({ 'content-type': 'text/html; charset=utf-8' });

    var prodotto = req.params.idprodotto
    var nuovoprezzo = req.params.prezzo

    let modif = false
    prodotti.forEach(p => { if (p.id == prodotto) { p.prezzo = nuovoprezzo; modif = true } })


    if (modif)
        res.status(200).end("prodotto aggiornato!");
    else
        res.status(400).end("prodotto non esistente");


});

// eliminare un prodotto 

app.delete('/elimina/:idprodotto', function (req, res) {


    res.set({ 'content-type': 'text/html; charset=utf-8' });

    var prodotto = req.params.idprodotto

    var indice = -1

    prodotti.forEach(function (p, idx) {

        if (p.id == prodotto) indice = idx;
    })

    if (indice >= 0) {
        prodotti.splice(indice, 1)

        res.status(200).end("Eliminato prodotto " + prodotto);
    }

    else

        res.status(404).end("Prodotto non esistente" + prodotto);



});

// default
app.get('/*', function (req, res) {


    res.set({ 'content-type': 'text/html; charset=utf-8' });



    res.status(300).end("richiesta non valida");


});



var server = require('http').createServer(app).listen(porta);

console.log("Server in ascolto alla porta " + porta)

