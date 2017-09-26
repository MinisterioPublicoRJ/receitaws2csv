const RECEITAWS_URL = 'https://www.receitaws.com.br/v1/cnpj/'
let cnpjData, csv
let numberOfRequests = 0

function attachFormEvent() {
    document.getElementById('btn_form').onclick = function(e) {
        // prevent form submit
        e.preventDefault()

        // get cnpjs list
        let cnpjs = document.getElementById('cnpjs').value
        let cnpjsArray = splitCnpjsArray(cnpjs)

        // call fetch
        fetchCnpjs(cnpjsArray)
    }

    document.getElementById('download').onclick = function(e) {
        e.preventDefault()
        download('cnpj.csv', csv)
    }
}
attachFormEvent()

function splitCnpjsArray (cnpjs) {
    // split by line into array
    return cnpjs.split("\n")
}

function fetchCnpjs(cnpjsArray) {
    // empty cnpjsData
    cnpjsData = []

    numberOfRequests = cnpjsArray.length

    // call for every cnpj
    cnpjsArray.map((cnpj, i) => fetchCnpj(cnpj, i))
}

function fetchCnpj(cnpj, i) {
    // craft URL
    let url = `${RECEITAWS_URL}${cnpj}`

    // make call
    window.jsonp(url, function(res) {
        cnpjsData[i] = res

        // last call
        if (i === numberOfRequests - 1) {
            // wait a little bit before calling
            window.setTimeout(parseCnpjs, 1000)
        }
    })
}

function parseCnpjs() {
    csv = 'cnpj;nome;fantasia;logradouro;numero;complemento;bairro;municipio;uf;cep;telefone'
    cnpjsData.map(cnpj => {
        csv += `\n${cnpj.cnpj};${cnpj.nome};${cnpj.fantasia};${cnpj.logradouro};${cnpj.numero};${cnpj.complemento};${cnpj.bairro};${cnpj.municipio};${cnpj.uf};${cnpj.cep};${cnpj.telefone}`
    })
    document.getElementById('result').value = csv
}

// define window.jsonp(url, callback)
// https://sacha.me/articles/jsonp-demystified/
(function () {
    var _callbacks = 0

    window.jsonp = function (url, callback) {
    var id = 'jsonp_cb_' + _callbacks,
        existing = document.scripts[0],
        script = document.createElement('script')

    script.src = url + (~url.indexOf('?') ? '&' : '?') + 'callback=' + id
    existing.parentNode.insertBefore(script, existing)

    window[id] = function (data) {
        script.parentNode.removeChild(script)
        callback(data)
        delete window[id]
    }

    _callbacks += 1
    }
}())

// https://ourcodeworld.com/articles/read/189/how-to-create-a-file-and-generate-a-download-with-javascript-in-the-browser-without-a-server
function download(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}