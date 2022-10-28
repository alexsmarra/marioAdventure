// function para nome da classe e tag dos elementos para criação
function novoElemento(tagName, className) {
    const elem = document.createElement(tagName)
    elem.className = className
    return elem
}

// Função construtora, criando elementos e fazendo appendChild deles
function Barreira(reversa = false) {
    this.elemento = novoElemento('div', 'barreira')

    const borda = novoElemento('div', 'borda')
    const b_esquerda = novoElemento('div', 'b-esquerda')
    const b_direita = novoElemento('div', 'b-direita')
    borda.appendChild(b_esquerda)
    borda.appendChild(b_direita)

    const corpo = novoElemento('div', 'corpo')
    const c_esquerdo = novoElemento('div', 'c-esquerdo')
    const c_direito = novoElemento('div', 'c-direito')
    corpo.appendChild(c_esquerdo)
    corpo.appendChild(c_direito)

    // criando condição para ordem do elemento 'corpo' e 'borda' dentro do elemento 'barreira' (teremos dois elementos barreiras com seus elementos principais com posiçoes inversas com relação um ao outro, para termos os canos do jogo pra cima e para baixo)
    this.elemento.appendChild(reversa ? corpo : borda)
    this.elemento.appendChild(reversa ? borda : corpo)

    // setando a altura dos elementos dentro de 'corpo'
    this.setAlturaEsquerdoCorpo = altura => c_esquerdo.style.height = `${altura}px`
    this.setAlturaDireitoCorpo = altura => c_direito.style.height = `${altura}px`
}

// teste
// const b = new Barreira(true)
// b.setAlturaEsquerdoCorpo(400)
// b.setAlturaDireitoCorpo(400)
// document.querySelector('[wm-flappy]').appendChild(b.elemento)

// function para o elemento 'par-de-barreiras', o elemento que compõe a div 'barreira'
function ParDeBarreiras(altura, abertura, x) {
    this.elemento = novoElemento('div', 'par-de-barreiras')
    
    // para 'barreira' superior e inferiro
    this.superior = new Barreira(true)
    this.inferior = new Barreira(false)

    // appendChild no 'par-de-barreiras' para o elemento da função construtora, veja que será com o  reversa = true, e no segundo com  reversa = false
    this.elemento.appendChild(this.superior.elemento)
    this.elemento.appendChild(this.inferior.elemento)

    this.sortearAbertura = () => {
        // para altura do cano superior
        const alturaSuperior = Math.random() * (altura - abertura)
        // para altura do cano inferior
        const alturaInferior = altura - abertura - alturaSuperior

        // setando a altura das partes superior e inferior do 'corpo'
        this.superior.setAlturaEsquerdoCorpo(alturaSuperior)
        this.superior.setAlturaDireitoCorpo(alturaSuperior)
        this.inferior.setAlturaEsquerdoCorpo(alturaInferior)
        this.inferior.setAlturaDireitoCorpo(alturaInferior)
    }

    // pegando a posição atual do elemento 'par-de-barreiras' (o split é para pegarmos apenas o número sem os pixels)
    this.getX = () => parseInt(this.elemento.style.left.split('px')[0])
    // setando a posição do elemento 'par-de-barreiras'
    this.setX = x => this.elemento.style.left = `${x}px`
    // pegando a largura do elemento
    this.getLargura = () => this.elemento.clientWidth

    // invocando as funções
    this.sortearAbertura()
    this.setX(x)
} 

// teste
// const b = new ParDeBarreiras(700, 200, 400)
// document.querySelector('[wm-flappy]').appendChild(b.elemento)

// function para múltiplas barreiras (espaço é o espaço entre as barreiras)
function Barreiras(altura, largura, abertura, espaco, notificarPonto) {
    this.pares = [
        // colocaremos essas barreiras inicialmente fora da tela do jogo (do lado direito), cada uma em sua posição (mais à direita)
        new ParDeBarreiras(altura, abertura, largura),
        new ParDeBarreiras(altura, abertura, largura + espaco),
        new ParDeBarreiras(altura, abertura, largura + espaco * 2),
        new ParDeBarreiras(altura, abertura, largura + espaco * 3),
        new ParDeBarreiras(altura, abertura, largura + espaco * 4),
        new ParDeBarreiras(altura, abertura, largura + espaco * 5),
        new ParDeBarreiras(altura, abertura, largura + espaco * 6)
    ]

    // constante para deslocamento das barreiras
    const deslocamento = 3
    this.animar = () => {
        this.pares.forEach(par => {
            par.setX(par.getX() - deslocamento)

            // quando o elemento sair da área do jogo (ou seja, quando ele passar da tela inteira teremos que sortear suas posições e fazer passarem pela tela novamente, fazendo cada uma na sua hora voltar para o final da tela, ou seja, fora do jogo).
            if(par.getX() < -par.getLargura()) {
                par.setX(par.getX() + espaco * this.pares.length)
                // sorteando as barreiras para alterar sua posições em seu retorno à tela
                par.sortearAbertura()
            }

            // function para quando a barreira estiver no meio da tela
            const meio = largura / 2
            const cruzouOmeio = par.getX() + deslocamento >= meio
                && par.getX() < meio
                // se todas as condições acima forem satisfeitas, agora, abaixo, se a const cruzouOmeio for verdadeira, vamos chamar o notificarPonto()
            if(cruzouOmeio) notificarPonto()
        })
    }
}

// para o personagem do jogo
function Mario(alturaJogo) {
    // se o usuário digita determinada tecla no teclado, o mário começa a subir, caso contrário, ele começa a cair
    let voando = false
    this.elemento = novoElemento('img', 'mario')
    this.elemento.src = 'imgs/mario.png'

    // pegando posição (vertical), da mesma forma que nas functions acima 
    this.getY = () => parseInt(this.elemento.style.bottom.split('px')[0])
    // setando
    this.setY = y => this.elemento.style.bottom = `${y}px` 

    // quando o usuário estiver clicando qualquer tecla, a let voando será true
    window.onkeydown = e => voando = true
    // e será false quando soltar a tecla
    window.onkeyup = e => voando = false

    // se tiver voando sobe 8px, se não, desce 5px
    this.animar = () => {
        const novoY = this.getY() + (voando ? 8 : -5)
        // altura máxima do mário
        const alturaMaxima = alturaJogo - this.elemento.clientWidth

        // se ele estiver abaixo do chão, acima da altura máxima, já no else é caso ele esteja na altura disponível, aí sim será considerado
        if(novoY <= 0) {
            this.setY(0)
        } else if (novoY >= alturaMaxima) {
            this.setY(alturaMaxima)
        } else {
            this.setY(novoY)
        }
    }

    // altura inicial do mario
    this.setY(alturaJogo / 2)
}

function Progresso() {
    this.elemento = novoElemento('span', 'progresso')
    this.atualizarPontos = pontos => {
        this.elemento.innerHTML = pontos
    }
    
    this.atualizarPontos(0)
}

function estaoSobrepostos(elementoA, elementoB) {
    //retangulo associado ao elementoA e elementoB
    const a = elementoA.getBoundingClientRect()
    const b = elementoB.getBoundingClientRect()

    const horizontal = a.left + a.width > b.left + 30
        && b.left + b.width > a.left + 30
    const vertical = a.top + a.height > b.top + 30
        && b.top + b.height > a.top + 30

    return horizontal && vertical
}

function colidiu(mario, barreiras) {
    let colidiu = false
    barreiras.pares.forEach(ParDeBarreiras => {
        if(!colidiu) {
            const superior = ParDeBarreiras.superior.elemento
            const inferior = ParDeBarreiras.inferior.elemento
            colidiu = estaoSobrepostos(mario.elemento, superior)
                || estaoSobrepostos(mario.elemento, inferior)
        }
    })
    return colidiu
}

function MarioAdventure() {
    let pontos = 0

    const areaDojogo = document.querySelector('[wm-flappy]')
    const altura = areaDojogo.clientHeight
    const largura = areaDojogo.clientWidth

    const progresso = new Progresso()
    const barreiras = new Barreiras(altura, largura, 220, 400, 
        () => progresso.atualizarPontos(++pontos))
    const mario = new Mario(altura)

    areaDojogo.appendChild(progresso.elemento)
    areaDojogo.appendChild(mario.elemento)
    barreiras.pares.forEach(par => areaDojogo.appendChild(par.elemento))

    this.start = () => {
        // loop do jogo
        const temporizador = setInterval(() => {
            barreiras.animar()
            mario.animar()
            if(colidiu(mario, barreiras)) {
                clearInterval(temporizador)
            }
        }, 20)
    }
}

new MarioAdventure().start()

