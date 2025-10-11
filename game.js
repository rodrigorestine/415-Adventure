// --- ESTADO DO JOGO E CONTROLES DE INTERFACE ---
const ESTADOS = {
    START: 'START',
    RUNNING: 'RUNNING',
    GAME_OVER: 'GAME_OVER',
    WIN: 'WIN'
};
let ESTADO_JOGO = ESTADOS.START;

const startScreen = document.getElementById('startScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
const winScreen = document.getElementById('winScreen');
const finalScoreText = document.getElementById('finalScoreText');

function iniciarJogo() {
    if (ESTADO_JOGO !== ESTADOS.RUNNING) {
        ESTADO_JOGO = ESTADOS.RUNNING;
        startScreen.classList.add('hidden');
        gameOverScreen.classList.add('hidden');
        winScreen.classList.add('hidden');
        TEMPO_INICIO_JOGO = Date.now(); // Inicia o contador de tempo
        LAST_PLATFORM_REMODEL = Date.now(); // Inicia o contador de remodelagem
        gameLoop();
    }
}

function exibirGameOver() {
    ESTADO_JOGO = ESTADOS.GAME_OVER;
    finalScoreText.textContent = `Pontuação final: ${PONTOS}`;
    gameOverScreen.classList.remove('hidden');
}

function exibirWinScreen() {
     ESTADO_JOGO = ESTADOS.WIN;
     winScreen.classList.remove('hidden');
}

function resetarJogo() {
    // Resetar variáveis
    PONTOS = 0;
    JOGADOR_TEM_ARMA = false;
    ESTAGIO_ESCADA = 0;
    PENIS_COLETADOS = 0;
    UPGRADES_GANHOS_PENIS = 0;
    venceu = false;
    
    // Resetar novos estados
    PODER_SLOW_MOTION_ATIVO = false;
    PODER_SUPER_TIRO_ATIVO = false;
    PODER_SHIELD_RESTANTE = 0;
    TEMPO_FIM_PODER = 0;
    LAST_PLATFORM_REMODEL = Date.now(); // Reseta o contador do remodelamento

    // Resetar Arrays de Sprites
    plataformas = [];
    plataformas.push(new Plataforma(0, ALTURA - ALTURA_CHAO, LARGURA, ALTURA_CHAO));
    inimigos = [];
    projeteis = [];
    curas = [];
    upgradesEstrela = [];
    bigApples = []; // Reset do array da Big Apple

    // Resetar Jogador
    jogador.vidaMaxima = 100; // Resetar vida máxima base
    jogador.vidaAtual = 100;
    jogador.linhasTiro = 1;
    jogador.x = 50;
    jogador.y = ALTURA - 100;
    jogador.velocidadeY = 0;
    jogador.velocidadeX = 0;
    
    // Resetar Mapa
    remodelarPlataformas();
    
    // Iniciar
    iniciarJogo(); 
}

// --- FIM DOS CONTROLES DE INTERFACE ---


// Configurações Globais
const LARGURA = 800;
const ALTURA = 600;
const GRAVIDADE = 1;
const VELOCIDADE_PULO = -20;
const VELOCIDADE_PULO_DUPLO = VELOCIDADE_PULO * 0.5;
const VELOCIDADE_MOVIMENTO = 5;
const PONTOS_PARA_ARMA = 50;
const PROJETIL_VELOCIDADE = 10;
const VELOCIDADE_SUBIDA_ESCADA = 4;
const TAMANHO_JOGADOR = { width: 80, height: 80 };
const MAX_LINHAS_TIRO = 4;

// ZIGUE-ZAGUE
const TEMPO_INICIO_ZIGZAG = 60000; 

// CHANCE DE CURA RARA (AGORA É UPGRADE DE VIDA MÁXIMA)
const CHANCE_UPGRADE_VIDA_MAX = 0.1; 
const AUMENTO_VIDA_MAX = 50; 

// Configurações de Altura Mínima para Plataformas Flutuantes
const ALTURA_CHAO = 40;
const MARGEM_SEGURANCA = 110; 

// Configurações da Big Apple
const CHANCE_SPAWN_BIG_APPLE = 0.7; // Aumentada a chance
const TEMPO_MINIMO_BIG_APPLE_SEGUNDOS = 25; // Disponível a partir dos 25s
const DURACAO_PODER_SEGUNDOS = 15; 
const PROJETIL_BIG_APPLE_LARGURA = 20;
const PROJETIL_BIG_APPLE_ALTURA = 40;
const DANO_SHIELD = 10; // Capacidade do escudo

// Variáveis de Estado Temporário
let LAST_PLATFORM_REMODEL = Date.now();
const REMODEL_INTERVAL_MS = 25000; // 25 segundos (reduzido)

// Status dos Poderes
let PODER_SLOW_MOTION_ATIVO = false;
let PODER_SUPER_TIRO_ATIVO = false;
let PODER_SHIELD_RESTANTE = 0; // Quantidade de hits restantes no escudo
let TEMPO_FIM_PODER = 0;

let PONTOS = 0;
let JOGADOR_TEM_ARMA = false;
let ESTAGIO_ESCADA = 0;

// Upgrade de Pênis
let PENIS_COLETADOS = 0;
const PENIS_POR_UPGRADE = 5; 
let UPGRADES_GANHOS_PENIS = 0; 
let INIMIGO_FRACO_CONTADOR = 0; 

// Cores
const BRANCO = 'white';
const PRETO = 'black';
const AZUL = 'blue';
const VERMELHO = 'red';
const VERDE = 'green';
const AMARELO = 'yellow';
const ROXO = '#800080';
const ROSA_CURA = '#ff69b4';
const CINZA_ESCURO = '#323232';
const LARANJA_PROJETIL = 'orange';
const CINZA_ARMA_PROJETIL = 'red';
const OURO = '#ffd700';
const ROSA_PISCA = '#ffc0cb'; 
const ROXO_PISCA = '#c080ff'; 
const AZUL_BRILHANTE = '#00FFFF'; 

// Inicialização do Canvas
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Elementos de UI 
const statusArmaElement = document.getElementById('status-arma');
const placarElement = document.getElementById('placar'); 

// --- ARRAYS GLOBAIS E ESTADO DO JOGO ---
let plataformas = [];
let inimigos = [];
let projeteis = [];
let curas = [];
let upgradesEstrela = [];
let bigApples = []; 
let todosOsSprites = [];

// --- GERENCIAMENTO DE ENTRADA (Teclas) ---
const keys = {};

// --- CARREGAMENTO DE IMAGENS (8 Assets) ---
const assets = {
    fundo: null,
    jogador: null,
    plataforma: null, 
    inimigo_fraco: null, 
    inimigo_medio: null, 
    inimigo_forte: null,
    upgrade_penis: null,
    big_apple: null, 
};

const totalAssets = 8; 
let assetsCarregados = 0;
let plataformaVitoriaSprite = null;

function carregarImagem(caminho, nome) {
    const img = new Image();
    img.onload = () => {
        assets[nome] = img;
        assetsCarregados++;
        if (assetsCarregados === totalAssets) {
            console.log("Todos os Assets carregados. O jogo está pronto para iniciar.");
        }
    };
    img.onerror = () => {
        console.warn(`Erro ao carregar imagem: ${caminho}. Usando cor sólida como fallback.`);
        assetsCarregados++;
        if (assetsCarregados === totalAssets) {
             console.log("Assets carregados. O jogo está pronto para iniciar (com fallbacks).");
        }
    };
    img.src = caminho;
}

// Inicia o carregamento
carregarImagem("floresta_fundo.png", "fundo");
carregarImagem("jogador_sprite.png", "jogador");
carregarImagem("plataforma_sprite.png", "plataforma");
carregarImagem("inimigo_fraco.png", "inimigo_fraco");
carregarImagem("inimigo_medio.png", "inimigo_medio");
carregarImagem("inimigo_forte.png", "inimigo_forte");
carregarImagem("upgrade_penis.png", "upgrade_penis"); 
carregarImagem("big_apple.png", "big_apple"); 


// --- FUNÇÕES DE DESENHO AUXILIAR ---

function desenharPlataformaFinal(x, y) {
    const largura = 200;
    const altura = 20;
    ctx.fillStyle = PRETO;
    ctx.fillRect(x, y + 50, largura, altura);
    const corpoL = 150;
    const corpoH = 20;
    const corpoX = x + (largura - corpoL) / 2;
    const corpoY = y + 50 - corpoH;
    ctx.fillStyle = OURO;
    ctx.fillRect(corpoX, corpoY, corpoL, corpoH);
    const raioGlande = 15;
    ctx.beginPath();
    ctx.arc(x + largura - 40, corpoY + corpoH / 2, raioGlande, 0, Math.PI * 2);
    ctx.fill();
}

function desenharEscada(x, y, altura) {
    const largura = 40;
    const corEscada = AMARELO;
    const larguraLateral = 5;
    const alturaDegrau = 4;
    
    ctx.fillStyle = corEscada;
    ctx.fillRect(x, y, larguraLateral, altura);
    ctx.fillRect(x + largura - larguraLateral, y, larguraLateral, altura);
    
    const numDegraus = Math.max(2, Math.floor(altura / 30));
    const espacoEntreDegraus = altura / numDegraus;
    const larguraDegrau = largura - (2 * larguraLateral);
    
    for (let i = 0; i < numDegraus; i++) {
        const degrauY = y + altura - (i + 1) * espacoEntreDegraus;
        ctx.fillRect(x + larguraLateral, degrauY, larguraDegrau, alturaDegrau);
    }
}

function desenharEstrela(ctx, x, y, raioExterno, raioInterno, pontas, cor) {
    let rotation = Math.PI / 2 * 3;
    let step = Math.PI / pontas;
    
    ctx.beginPath();
    ctx.moveTo(x, y - raioExterno);
    for (let i = 0; i < pontas; i++) {
        rotation += step;
        ctx.lineTo(x + Math.cos(rotation) * raioInterno, y + Math.sin(rotation) * raioInterno);
        rotation += step;
        ctx.lineTo(x + Math.cos(rotation) * raioExterno, y + Math.sin(rotation) * raioExterno);
    }
    ctx.closePath();
    ctx.fillStyle = cor;
    ctx.fill();
}


// --- CLASSES E LÓGICA ---

class Sprite {
    constructor(x, y, w, h, cor) {
        this.x = x;
        this.y = y;
        this.width = w;
        this.height = h;
        this.color = cor;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    colide(other) {
        return this.x < other.x + other.width &&
               this.x + this.width > other.x &&
               this.y < other.y + other.height &&
               this.y + this.height > other.y;
    }
}

class Plataforma extends Sprite {
    constructor(x, y, largura, altura) {
        super(x, y, largura, altura, 'transparent'); 
    }
    
    draw() {
        if (assets.plataforma) {
            ctx.drawImage(assets.plataforma, this.x, this.y, this.width, this.height);
        } else {
             ctx.fillStyle = PRETO; 
             ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }
}

class PlataformaFinal extends Sprite {
    constructor() {
        super(LARGURA - 240, 50, 200, 70, 'transparent'); 
    }
    draw() {
        desenharPlataformaFinal(this.x, this.y - 50);
    }
}

class Escada extends Sprite {
    constructor(x, y, altura) {
        super(x, y, 40, altura, 'transparent');
    }
    draw() {
        desenharEscada(this.x, this.y, this.height);
    }
}

class Jogador extends Sprite {
    constructor(x, y) {
        super(x, y, TAMANHO_JOGADOR.width, TAMANHO_JOGADOR.height, AZUL);
        this.velocidadeY = 0;
        this.velocidadeX = 0;
        this.noChao = false;
        this.vidaMaxima = 100;
        this.vidaAtual = 100;
        this.pulosExtrasRestantes = 1;
        this.subindoEscada = false;
        this.linhasTiro = 1;
    }

    gravidadeEPulo() {
        if (!this.subindoEscada) {
            this.velocidadeY += GRAVIDADE;
            if (this.velocidadeY > 15) this.velocidadeY = 15;
        } else {
            this.velocidadeY = 0;
        }
    }

    pular() {
        if (this.noChao && !this.subindoEscada) {
            this.velocidadeY = VELOCIDADE_PULO;
            this.noChao = false;
            this.pulosExtrasRestantes = 1;
            return;
        }
        if (!this.noChao && this.pulosExtrasRestantes > 0 && !this.subindoEscada) {
            this.velocidadeY = VELOCIDADE_PULO_DUPLO;
            this.pulosExtrasRestantes -= 1;
        }
    }

    subir_escada(direcao) {
        if (plataformas.some(p => p instanceof Escada && this.colide(p))) {
             this.subindoEscada = true;
             this.y += -direcao * VELOCIDADE_SUBIDA_ESCADA;
        } else {
            this.subindoEscada = false;
        }
    }

    moverX(direcao) {
        this.velocidadeX = direcao * VELOCIDADE_MOVIMENTO;
    }

    atirar() {
        if (!JOGADOR_TEM_ARMA) return;
        
        // Se o SUPER TIRO estiver ativo, use as novas configurações
        const isSuperTiro = PODER_SUPER_TIRO_ATIVO;
        const numLinhas = isSuperTiro ? this.linhasTiro * 2 : this.linhasTiro; // Dobro da área lateral
        const espacamentoHorizontal = isSuperTiro ? 20 : 10; 
        const espacamentoVertical = 15; 
        const larguraTotal = (numLinhas - 1) * espacamentoHorizontal;
        const startX = this.x + this.width / 2 - larguraTotal / 2;
        
        for (let i = 0; i < numLinhas; i++) {
            const offsetX = i * espacamentoHorizontal;
            const projetil = new Projetil(startX + offsetX, this.y - i * espacamentoVertical, isSuperTiro);
            projeteis.push(projetil);
        }
    }
    
    upgradeForcaTiro() {
        this.linhasTiro++;
    }

    upgradeVidaMaxima() {
        this.vidaMaxima += AUMENTO_VIDA_MAX;
        this.vidaAtual = this.vidaMaxima; // Cura totalmente ao aumentar
    }

    draw() {
        // Desenho do Escudo (Shield)
        if (PODER_SHIELD_RESTANTE > 0) {
            ctx.beginPath();
            ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.width * 1.2, 0, Math.PI * 2);
            
            // Efeito Brilhante Piscante
            const alpha = 0.5 + Math.sin(Date.now() / 100) * 0.2; 
            ctx.fillStyle = `rgba(0, 255, 255, ${alpha})`; 
            ctx.fill();
            
            // Desenha a contagem de hits restantes
            ctx.fillStyle = BRANCO;
            ctx.textAlign = 'center';
            ctx.font = 'bold 16px Arial';
            ctx.fillText(`Shield: ${PODER_SHIELD_RESTANTE}`, this.x + this.width / 2, this.y - 30);
        }
        
        // Desenho do Jogador
        if (assets.jogador) {
            ctx.drawImage(assets.jogador, this.x, this.y, this.width, this.height);
        } else {
            ctx.fillStyle = AZUL;
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }

    drawBarraVida() {
        const larguraBarra = this.width;
        const alturaBarra = 7;
        const x = this.x;
        const y = this.y - 15; 

        // Barra de Vida Máxima (indicador do máximo)
        ctx.fillStyle = CINZA_ESCURO;
        // Ajusta o comprimento da barra para refletir o máximo
        const larguraMaximaBase = larguraBarra + (this.vidaMaxima - 100) * (larguraBarra / 100);
        ctx.fillRect(x, y, larguraMaximaBase, alturaBarra);

        // Barra de Vida Atual
        const larguraVida = larguraMaximaBase * (this.vidaAtual / this.vidaMaxima);
        ctx.fillStyle = VERDE;
        ctx.fillRect(x, y, larguraVida, alturaBarra);
        
        ctx.fillStyle = OURO;
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`${this.linhasTiro}x`, this.x + this.width / 2, this.y - 20);
        
        const penisCor = (PENIS_COLETADOS >= PENIS_POR_UPGRADE) ? VERDE : ROXO;
        ctx.fillStyle = penisCor;
        ctx.font = '12px Arial';
        ctx.fillText(`Pênis: ${PENIS_COLETADOS} / ${PENIS_POR_UPGRADE}`, this.x + this.width / 2, this.y + this.height + 30);
    }

    update() {
        const subindo = keys['w'] || keys[38];
        const descendo = keys['s'] || keys[40];

        if (plataformas.some(p => p instanceof Escada && this.colide(p))) {
            if (subindo) this.subir_escada(1);
            else if (descendo) this.subir_escada(-1);
            this.noChao = true;
        } else {
            this.subindoEscada = false;
        }

        this.gravidadeEPulo();
        this.y += this.velocidadeY;
        this.noChao = false;

        for (const plat of plataformas) {
            if (this.colide(plat) && !(plat instanceof Escada)) {
                if (this.velocidadeY > 0) {
                    this.y = plat.y - this.height;
                    this.velocidadeY = 0;
                    this.noChao = true;
                    this.pulosExtrasRestantes = 1;
                } else if (this.velocidadeY < 0) {
                    this.y = plat.y + plat.height;
                    this.velocidadeY = 0;
                }
            }
        }
        if (plataformaVitoriaSprite && this.colide(plataformaVitoriaSprite)) {
             if (this.velocidadeY >= 0) {
                 this.y = plataformaVitoriaSprite.y + 50 - this.height;
                 this.velocidadeY = 0;
                 this.noChao = true;
                 this.pulosExtrasRestantes = 1;
             }
        }

        this.x += this.velocidadeX;
        
        if (this.x < 0) {
            this.x = 0;
            this.velocidadeX = 0;
        }
        if (this.x + this.width > LARGURA) {
            this.x = LARGURA - this.width;
            this.velocidadeX = 0;
        }

        for (const plat of plataformas) {
            if (this.colide(plat) && !(plat instanceof Escada)) {
                if (this.velocidadeX > 0) {
                    this.x = plat.x - this.width;
                } else if (this.velocidadeX < 0) {
                    this.x = plat.x + plat.width;
                }
            }
        }
    }
}

class Projetil extends Sprite {
    constructor(x, y, isSuperTiro = false) {
        super(x - 5, y - 20, 10, 20, 'transparent');
        this.velocidadeY = -PROJETIL_VELOCIDADE;
        this.isSuperTiro = isSuperTiro;
    }

    draw() {
        const corCorpo = this.isSuperTiro ? VERMELHO : CINZA_ARMA_PROJETIL;
        const corPonta = this.isSuperTiro ? BRANCO : LARANJA_PROJETIL;
        
        let largura = 10;
        let altura = 20;

        if (this.isSuperTiro) {
            largura = PROJETIL_BIG_APPLE_LARGURA;
            altura = PROJETIL_BIG_APPLE_ALTURA;
            // Ajusta a posição X para centralizar o tiro maior
            this.x = this.x + 5 - largura / 2; 
        }
        
        // Efeito Piscante (Super Tiro)
        if (this.isSuperTiro && Date.now() % 200 < 100) {
            ctx.fillStyle = corPonta;
            ctx.fillRect(this.x, this.y, largura, altura);
        } else {
             ctx.fillStyle = corCorpo;
             ctx.fillRect(this.x, this.y, largura, altura);
        }

        // Ponta do tiro
        ctx.fillStyle = corPonta;
        ctx.beginPath();
        ctx.arc(this.x + largura / 2, this.y, 2, 0, Math.PI * 2);
        ctx.fill();
    }

    update() {
        this.y += this.velocidadeY;
        if (this.y < 0) {
            this.kill = true;
        }
    }
}

class UpgradeEstrela extends Sprite {
    constructor() {
        const TAMANHO = 25;
        super(Math.random() * (LARGURA - TAMANHO), -TAMANHO, TAMANHO, TAMANHO, 'transparent');
        this.velocidadeY = Math.random() * 2 + 1;
        this.pisca = 0;
    }

    draw() {
        this.pisca++;
        let cor = (this.pisca % 20 < 10) ? VERMELHO : BRANCO;
        
        desenharEstrela(ctx, this.x + this.width / 2, this.y + this.height / 2, this.width / 2, this.width / 4, 5, cor);
    }

    update() {
        this.y += this.velocidadeY;
        if (this.y > ALTURA) this.kill = true;
    }
}

class UpgradePenis extends Sprite {
    constructor() {
        const TAMANHO = 120; 
        super(Math.random() * (LARGURA - TAMANHO), -TAMANHO, TAMANHO, TAMANHO, 'transparent');
        this.velocidadeY = Math.random() * 2.5 + 1.5; 
        this.pisca = 0; 
    }

    draw() {
        this.pisca++;
        const corBase = ROSA_CURA;
        const corPisca = ROSA_PISCA; 
        const corAtual = (this.pisca % 15 < 7) ? corBase : corPisca;

        if (assets.upgrade_penis) {
            ctx.filter = `hue-rotate(${this.pisca * 10}deg)`; 
            ctx.drawImage(assets.upgrade_penis, this.x, this.y, this.width, this.height);
            ctx.filter = 'none'; 
        } else {
             ctx.fillStyle = corAtual; 
             ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }

    update() {
        this.y += this.velocidadeY;
        if (this.y > ALTURA) this.kill = true;
    }
}

class BigApple extends Sprite {
    constructor(x, y) {
        // Mantemos o tamanho de 70x70
        const TAMANHO = 70; 
        super(x, y, TAMANHO, TAMANHO, 'transparent');
        this.pisca = 0;
    }

    draw() {
        this.pisca++;
        
        // 1. Efeito de Brilho Pulsante (Performance Otimizada)
        // O brilho continua, mas sem o filtro de rotação de cor
        const brilho = Math.abs(Math.sin(this.pisca * 0.1)) * 15;
        ctx.shadowColor = 'rgba(255, 0, 0, 1.0)'; // Amarelo opacidade máxima
        ctx.shadowBlur = brilho; 

        if (assets.big_apple) {
            // Desenha a imagem com o efeito de sombra
            ctx.drawImage(assets.big_apple, this.x, this.y, this.width, this.height);
        } else {
             // Fallback: Desenho de maçã
            const corBase = '#FF4500'; 
            const corPisca = '#FFD700'; 
            const corAtual = (this.pisca % 10 < 5) ? corBase : corPisca;

            ctx.fillStyle = corAtual;
            ctx.beginPath();
            ctx.arc(this.x + this.width / 2, this.y + this.height * 0.6, this.width / 2, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = VERDE;
            ctx.fillRect(this.x + this.width / 2 - 3, this.y, 6, 15);
        }

        // 2. Resetar Sombra IMEDIATAMENTE após o desenho do sprite
        ctx.shadowBlur = 0; 
        ctx.shadowColor = 'transparent';
        
        
    }

    update() {
        // A maçã fica parada na plataforma
    }
}


class InimigoBase extends Sprite {
    constructor(velocidadeBase, tipo, assetName, wBase, hBase, corFallback, tamanhoExtra) {
        
        const w = wBase + tamanhoExtra * 1.5;
        const h = hBase + tamanhoExtra;
        
        super(Math.random() * (LARGURA - w), -h, w, h, 'transparent');
        this.velocidadeY = velocidadeBase + Math.random() * 1;
        this.vidaBase = (tipo === 'forte') ? 5 : (tipo === 'medio') ? 2 : 1;
        this.vida = this.vidaBase + Math.floor(tamanhoExtra / 10); 
        this.tipo = tipo; 
        this.asset = assetName;
        this.corFallback = corFallback;
        
        this.velocidadeX = 0;
        this.direcaoHorizontal = (Math.random() < 0.5) ? 2 : -2; 
        this.ultimoSwitch = Date.now();
        this.dano = 20; 
    }
    
    handleZigZag() {
        const tempoDecorrido = Date.now() - TEMPO_INICIO_JOGO;
        
        if (tempoDecorrido < TEMPO_INICIO_ZIGZAG) {
            this.velocidadeX = 0;
            return;
        }
        
        if (Date.now() - this.ultimoSwitch > 1000) {
            this.direcaoHorizontal *= -1;
            this.ultimoSwitch = Date.now();
        }

        this.velocidadeX = this.direcaoHorizontal;
        
        if (this.x + this.width > LARGURA || this.x < 0) {
            this.direcaoHorizontal *= -1;
            this.ultimoSwitch = Date.now();
        }
    }

    draw() {
        if (assets[this.asset]) {
            ctx.drawImage(assets[this.asset], this.x, this.y, this.width, this.height);
        } else {
             ctx.fillStyle = this.corFallback;
             ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }

    update() {
        this.handleZigZag(); 
        
        let velocidadeQueda = this.velocidadeY;
        
        // Aplica o Slow Motion
        if (PODER_SLOW_MOTION_ATIVO) {
            velocidadeQueda *= 0.30; // Reduz a velocidade de queda
        }
        
        this.y += velocidadeQueda;
        this.x += this.velocidadeX; 
        
        if (this.y > ALTURA) {
            this.kill = true;
            if (this.tipo !== 'cura') PONTOS += 10;
        }
    }
}

class InimigoPadrao extends InimigoBase {
    constructor(velocidadeBase, tipo, tamanhoExtra) {
        const wBase = 75; 
        const hBase = 125; 
        const assetName = (tipo === 'medio') ? "inimigo_medio" : "inimigo_fraco";
        const corFallback = (tipo === 'medio') ? CINZA_ESCURO : AMARELO;
        
        super(velocidadeBase, tipo, assetName, wBase, hBase, corFallback, tamanhoExtra);
        this.pontuacaoMorte = (tipo === 'medio') ? 15 : 10;
        this.dano = 20;
    }
}

class InimigoForte extends InimigoBase {
    constructor(velocidadeBase, tamanhoExtra) {
        const wBase = 75; 
        const hBase = 125; 
        
        super(velocidadeBase, 'forte', 'inimigo_forte', wBase, hBase, ROXO, tamanhoExtra); 
        this.pontuacaoMorte = 50;
        this.dano = 20;
    }
}

class CoracaoCura extends InimigoBase {
    constructor(isLifeUpgrade) {
        // Se for upgrade de vida (roxo), é o dobro do tamanho (30x30)
        const TAMANHO = isLifeUpgrade ? 30 : 15; 
        super(Math.random() * 2 + 1, 'cura', null, TAMANHO, TAMANHO, isLifeUpgrade ? ROXO : ROSA_CURA, 0); 
        this.valorCura = 25; 
        this.isLifeUpgrade = isLifeUpgrade;
        this.pisca = 0;
    }
    
    draw() {
        this.pisca++;
        let corAtual;
        
        if (this.isLifeUpgrade) {
            // Coração Roxo Piscante
            corAtual = (this.pisca % 10 < 5) ? ROXO : ROXO_PISCA;
        } else {
            corAtual = ROSA_CURA;
        }
        
        ctx.fillStyle = corAtual;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Desenha o Símbolo de Cura (Cruz)
        ctx.fillStyle = BRANCO;
        ctx.fillRect(this.x + this.width/3, this.y + this.height/6, this.width/3, this.height*2/3);
        ctx.fillRect(this.x + this.width/6, this.y + this.height/3, this.width*2/3, this.height/3);
        
        // Texto para Upgrade de Vida Máxima
        if (this.isLifeUpgrade) {
             ctx.fillStyle = BRANCO;
             ctx.textAlign = 'center';
             ctx.font = 'bold 10px Arial';
             ctx.fillText('MAX', this.x + this.width / 2, this.y + this.height / 2 + 3);
        }
    }
}


// --- LÓGICA DE DIFICULDADE E SPAN ---

let ultimoSpawnInimigo = 0;
let ultimoSpawnCura = 0;
let ultimoSpawnUpgrade = 0;
let ultimoSpawnPenis = 0;
const TEMPO_SPAWN_CURA = 8000;
const TEMPO_SPAWN_UPGRADE = 15000; 
const TEMPO_SPAWN_PENIS = 8000; 

let TEMPO_INICIO_JOGO = Date.now();
let venceu = false;

function calcularDificuldade(pontos) {
    let SPAWN_TEMPO_BASE = 750;
    let novoTempoSpawn = SPAWN_TEMPO_BASE;
    let novaVelocidadeInimigo = 1;
    let tamanhoExtraInimigo = 0; 

    if (!JOGADOR_TEM_ARMA) {
        return { novoTempoSpawn, novaVelocidadeInimigo: 1, tamanhoExtraInimigo: 0 };
    }

    const dificuldadeExtra = Math.floor(Math.max(0, pontos - PONTOS_PARA_ARMA) / 100);
    
    novoTempoSpawn = Math.max(400, SPAWN_TEMPO_BASE - dificuldadeExtra * 20);
    
    const velocidadeBaseDificil = 3;
    novaVelocidadeInimigo = Math.min(6, velocidadeBaseDificil + dificuldadeExtra * 0.08); 
    
    if (UPGRADES_GANHOS_PENIS > 0) {
        const fatorCrescimentoGradual = Math.floor(Math.max(0, pontos - PONTOS_PARA_ARMA) / 250); 
        tamanhoExtraInimigo = fatorCrescimentoGradual * 0.8; 
    } else {
        tamanhoExtraInimigo = 0;
    }
    
    return { novoTempoSpawn, novaVelocidadeInimigo, tamanhoExtraInimigo };
}

function spawnInimigos() {
    const agora = Date.now();
    const { novoTempoSpawn, novaVelocidadeInimigo, tamanhoExtraInimigo } = calcularDificuldade(PONTOS);

    if (agora - ultimoSpawnInimigo > novoTempoSpawn) {
        const spawnChance = Math.random();
        let novoElemento;

        if (spawnChance < 0.4) {
            novoElemento = new InimigoPadrao(novaVelocidadeInimigo, 'fraco', tamanhoExtraInimigo);
        } else if (spawnChance < 0.7) {
            novoElemento = new InimigoForte(novaVelocidadeInimigo, tamanhoExtraInimigo);
        } else {
             novoElemento = new InimigoPadrao(novaVelocidadeInimigo + 1, 'medio', tamanhoExtraInimigo);
        }

        inimigos.push(novoElemento);
        ultimoSpawnInimigo = agora;
    }
}

function spawnCura() {
    const agora = Date.now();
    const tempoDecorrido = agora - TEMPO_INICIO_JOGO;
    
    if (agora - ultimoSpawnCura > TEMPO_SPAWN_CURA) {
        let novoCura;
        
        // Chance de Upgrade de Vida Máxima (após 1 min)
        if (tempoDecorrido >= 60000 && Math.random() < CHANCE_UPGRADE_VIDA_MAX) {
            novoCura = new CoracaoCura(true); // É upgrade de vida (roxo e grande)
        } else {
            novoCura = new CoracaoCura(false); // Cura normal (rosa)
        }
        
        curas.push(novoCura);
        ultimoSpawnCura = agora;
    }
}

function spawnUpgrade() {
    const agora = Date.now();
    if (JOGADOR_TEM_ARMA && jogador.linhasTiro < MAX_LINHAS_TIRO && (agora - ultimoSpawnUpgrade > TEMPO_SPAWN_UPGRADE)) {
        const novoUpgrade = new UpgradeEstrela();
        upgradesEstrela.push(novoUpgrade);
        ultimoSpawnUpgrade = agora;
    }
}

function spawnUpgradePenis() {
    const agora = Date.now();
    
    if (agora - ultimoSpawnPenis > TEMPO_SPAWN_PENIS) {
        
        const novoUpgrade = new UpgradePenis();
        upgradesEstrela.push(novoUpgrade); 

        ultimoSpawnPenis = agora;
    }
}

// --- FUNÇÕES DE CONSTRUÇÃO DE CENA (Corrigidas) ---
const NUM_PLATAFORMAS_FLUTUANTES = 4; // 4 plataformas em vez de 3

function remodelarPlataformas() {
    // 1. Filtra APENAS o chão (mantém o chão).
    // CORREÇÃO: Usa 'plataformas.filter' (correto) para preservar o chão.
    plataformas = plataformas.filter(p => p.y === ALTURA - ALTURA_CHAO);
    // Limpa a Big Apple antes de remodelar
    bigApples = [];
    
    // 2. Variável para rastrear a plataforma mais alta
    let plataformaMaisAlta = null;
    let maxY = ALTURA; 

    // 3. Recria plataformas flutuantes.
    for (let i = 0; i < NUM_PLATAFORMAS_FLUTUANTES; i++) {
        const largura = Math.random() * 250 + 50;
        const x = Math.random() * (LARGURA - largura);
        
        const yMax = ALTURA - ALTURA_CHAO - MARGEM_SEGURANCA; 
        const yMin = 150; 
        
        const y = Math.random() * (yMax - yMin) + yMin;
        
        const novaPlataforma = new Plataforma(x, y, largura, 20);
        
        let colideComOutra = plataformas.some(p => novaPlataforma.colide(p));
        
        if (!colideComOutra) {
            plataformas.push(novaPlataforma);
            
            // Verifica a plataforma mais alta
            if (y < maxY) {
                maxY = y;
                plataformaMaisAlta = novaPlataforma;
            }
        }
    }
    
    // 4. Lógica de Spawn da Big Apple
    const tempoDecorridoSegundos = (Date.now() - TEMPO_INICIO_JOGO) / 1000;
    
    // Big Apple aparece a partir da primeira remodelação (25s)
    if (tempoDecorridoSegundos >= TEMPO_MINIMO_BIG_APPLE_SEGUNDOS && 
        plataformaMaisAlta && 
        Math.random() < CHANCE_SPAWN_BIG_APPLE) {
        
        // Posiciona a Big Apple no centro da plataforma mais alta, ajustando para o novo tamanho (70x70)
        const TAMANHO_APPLE = 70;
        const appleX = plataformaMaisAlta.x + plataformaMaisAlta.width / 2 - TAMANHO_APPLE / 2;
        const appleY = plataformaMaisAlta.y - TAMANHO_APPLE; 
        bigApples.push(new BigApple(appleX, appleY));
    }
    
    // 5. Adiciona a escada e plataforma final (se aplicável)
    construirEscada(ESTAGIO_ESCADA);
    
    LAST_PLATFORM_REMODEL = Date.now();
}

function construirEscada(estagio) {
    // Filtra APENAS Escada e PlataformaFinal para remover antigas instâncias.
    plataformas = plataformas.filter(p => !(p instanceof Escada || p instanceof PlataformaFinal));
    plataformaVitoriaSprite = null;

    if (estagio === 0) return; 

    const ALTURA_MAXIMA_ESCADA = ALTURA - ALTURA_CHAO - 70; // 70 é a margem de cima
    const SEGMENTO = ALTURA_MAXIMA_ESCADA / 4;
    const escadaX = LARGURA - 40;

    for (let i = 1; i <= estagio; i++) {
        const alturaAtual = SEGMENTO * i;
        const escada = new Escada(escadaX, ALTURA - ALTURA_CHAO - alturaAtual, alturaAtual);
        plataformas.push(escada); 
    }

    if (estagio >= 4) {
        plataformaVitoriaSprite = new PlataformaFinal();
        plataformas.push(plataformaVitoriaSprite);
    }
}


// --- CONFIGURAÇÃO INICIAL ---

const chao = new Plataforma(0, ALTURA - ALTURA_CHAO, LARGURA, ALTURA_CHAO); 
plataformas.push(chao);

const jogador = new Jogador(50, ALTURA - 100);

remodelarPlataformas();

todosOsSprites = [...plataformas, jogador];

// --- GERENCIAMENTO DE ENTRADA ---

document.addEventListener('keydown', (e) => {
    if (ESTADO_JOGO !== ESTADOS.RUNNING) return; 
    
    const key = e.key.toLowerCase();
    keys[key] = true;
    keys[e.keyCode] = true;

    if (key === ' ') {
        e.preventDefault();
        jogador.pular();
    }
    if (key === 'enter') {
        jogador.atirar();
    }
});

document.addEventListener('keyup', (e) => {
    if (ESTADO_JOGO !== ESTADOS.RUNNING) return; 
    
    const key = e.key.toLowerCase();
    keys[key] = false;
    keys[e.keyCode] = false;

    if (key === 'a' || key === 'd' || e.keyCode === 37 || e.keyCode === 39) {
        jogador.moverX(0);
    }
});


// --- FUNÇÃO DE DESENHO DA UI ---
function desenharUI() {
    const corArma = JOGADOR_TEM_ARMA ? VERDE : VERMELHO;
    
    // 1. Atualiza o HUD na div #uiContainer (fora do canvas)
    const vidaTexto = `<strong>Vida:</strong> ${jogador.vidaAtual}% / ${jogador.vidaMaxima}%`;
    placarElement.innerHTML = vidaTexto; 
    statusArmaElement.innerHTML = `<strong>Status da Arma:</strong> <span style="color: ${corArma}">${JOGADOR_TEM_ARMA ? 'SIM' : 'NÃO'}</span> (Força: ${jogador.linhasTiro}x)`;

    // 2. Desenha informações no topo do CANVAS
    function renderizarMiniInfo(text, color, x, y, align = 'left', size = '20px') {
        ctx.font = `bold ${size} Arial`;
        ctx.textAlign = align;
        ctx.fillStyle = PRETO;
        ctx.fillText(text, x + 2, y + 2); // Sombra para legibilidade
        ctx.fillStyle = color;
        ctx.fillText(text, x, y);
    }
    
    // TÍTULO DO JOGO NO CANVAS
    ctx.font = '30px "Press Start 2P", Arial, sans-serif'; 
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffcc00'; 
    ctx.fillText("415 Adventure!", LARGURA / 2, 35); 
    
    // Linha de base para as informações laterais
    const TOP_Y = 60; 
    
    // 1. Pontos (Canto superior esquerdo)
    const textoPontos = `PONTOS: ${PONTOS}`;
    renderizarMiniInfo(textoPontos, BRANCO, 10, TOP_Y);
    
    // 2. Pênis (Abaixo dos Pontos)
    const penisCor = (PENIS_COLETADOS >= PENIS_POR_UPGRADE) ? VERDE : ROXO;
    const textoPenis = `PÊNIS: ${PENIS_COLETADOS}/${PENIS_POR_UPGRADE}`;
    renderizarMiniInfo(textoPenis, penisCor, 10, TOP_Y + 25);
    
    // 3. Tempo/Escada (Canto superior direito)
    const tempoDecorrido = Date.now() - TEMPO_INICIO_JOGO;
    const minutos = Math.floor(tempoDecorrido / 60000);
    const segundos = Math.floor((tempoDecorrido % 60000) / 1000);
    const textoTempo = `Tempo: ${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')} | Escada: ${UPGRADES_GANHOS_PENIS}/4`;
    renderizarMiniInfo(textoTempo, BRANCO, LARGURA - 300, TOP_Y);
    
    // 4. Status de Poder Ativo
    if (TEMPO_FIM_PODER > Date.now()) {
        const tempoRestante = Math.ceil((TEMPO_FIM_PODER - Date.now()) / 1000);
        let textoPoder = "";
        if (PODER_SLOW_MOTION_ATIVO) textoPoder = `SLOW: ${tempoRestante}s`;
        else if (PODER_SUPER_TIRO_ATIVO) textoPoder = `SUPER TIRO: ${tempoRestante}s`;
        
        if (textoPoder) {
            renderizarMiniInfo(textoPoder, AZUL_BRILHANTE, LARGURA / 2, TOP_Y + 25, 'center');
        }
    }
}


// --- LOOP PRINCIPAL DO JOGO ---

function updateGame() {
    // 1. Entrada de movimento contínuo
    if (keys['a'] || keys[37]) jogador.moverX(-1);
    else if (keys['d'] || keys[39]) jogador.moverX(1);
    else jogador.moverX(0);

    // 2. Controle de Tempo dos Poderes e Remodelagem
    const agora = Date.now();
    
    if (agora > TEMPO_FIM_PODER) {
        PODER_SLOW_MOTION_ATIVO = false;
        PODER_SUPER_TIRO_ATIVO = false;
    }
    
    if (agora - LAST_PLATFORM_REMODEL > REMODEL_INTERVAL_MS) {
        remodelarPlataformas();
    }
    
    // 3. Lógica da Escada e Vitória
    
    if (UPGRADES_GANHOS_PENIS > ESTAGIO_ESCADA) {
        ESTAGIO_ESCADA = UPGRADES_GANHOS_PENIS;
        remodelarPlataformas(); 
    }
    
    if (ESTAGIO_ESCADA === 4 && plataformaVitoriaSprite) {
        if (jogador.colide(plataformaVitoriaSprite)) {
            venceu = true;
        }
    }

    // 4. Atualiza Sprites e Spawns
    jogador.update();
    projeteis.forEach(p => p.update());
    inimigos.forEach(i => i.update());
    curas.forEach(c => c.update());
    upgradesEstrela.forEach(u => u.update());
    bigApples.forEach(a => a.update()); // Atualiza a Big Apple

    spawnInimigos();
    spawnCura();
    spawnUpgrade(); 
    spawnUpgradePenis();

    if (PONTOS >= PONTOS_PARA_ARMA && !JOGADOR_TEM_ARMA) {
        JOGADOR_TEM_ARMA = true;
    }


    // 5. Colisões
    
    // Colisão com Big Apple
    bigApples = bigApples.filter(apple => {
        if (jogador.colide(apple)) {
            
            // Ativa um poder aleatório
            const poder = Math.floor(Math.random() * 3);
            TEMPO_FIM_PODER = agora + DURACAO_PODER_SEGUNDOS * 1000;

            if (poder === 0) {
                // Poder 1: Slow Motion
                PODER_SLOW_MOTION_ATIVO = true;
                PODER_SUPER_TIRO_ATIVO = false;
                PODER_SHIELD_RESTANTE = 0;
            } else if (poder === 1) {
                // Poder 2: Super Tiro
                PODER_SUPER_TIRO_ATIVO = true;
                PODER_SLOW_MOTION_ATIVO = false;
                PODER_SHIELD_RESTANTE = 0;
            } else {
                // Poder 3: Escudo
                PODER_SHIELD_RESTANTE = DANO_SHIELD; // 10 hits
                PODER_SUPER_TIRO_ATIVO = false;
                PODER_SLOW_MOTION_ATIVO = false;
            }
            return false; // Remove a Big Apple
        }
        return !apple.kill;
    });
    
    // Colisão com upgrades (Estrela e Pênis) 
    upgradesEstrela = upgradesEstrela.filter(upgrade => {
        if (jogador.colide(upgrade)) {
            
            if (upgrade instanceof UpgradeEstrela) {
                jogador.upgradeForcaTiro();
                return false;
            }
            if (upgrade instanceof UpgradePenis) {
                PENIS_COLETADOS++;
                if (PENIS_COLETADOS >= PENIS_POR_UPGRADE) {
                    
                    if (UPGRADES_GANHOS_PENIS < 4) {
                        UPGRADES_GANHOS_PENIS++; 
                    }
                    
                    jogador.upgradeForcaTiro();
                    PENIS_COLETADOS = 0; 
                }
                return false;
            }
        }
        return !upgrade.kill;
    });

    // Colisão com Cura 
    curas = curas.filter(cura => {
        if (jogador.colide(cura)) {
            if (cura.isLifeUpgrade) {
                 jogador.upgradeVidaMaxima(); 
            } else {
                 jogador.vidaAtual = Math.min(jogador.vidaMaxima, jogador.vidaAtual + cura.valorCura); 
            }
            return false;
        }
        return !cura.kill;
    });

    // Colisão com Inimigos (Perda de Vida ou Escudo)
    inimigos = inimigos.filter(inimigo => {
        if (jogador.colide(inimigo)) {
            
            if (PODER_SHIELD_RESTANTE > 0) {
                PODER_SHIELD_RESTANTE--; // Escudo absorve o hit
            } else {
                jogador.vidaAtual = Math.max(0, jogador.vidaAtual - inimigo.dano); 
            }
            
            return false; // Inimigo é destruído no contato
        }
        return !inimigo.kill;
    });

    // Colisão de Projetil com Inimigo
    projeteis = projeteis.filter(projetil => {
        let acertou = false;
        inimigos.forEach(inimigo => {
            if (projetil.colide(inimigo)) {
                acertou = true;
                
                // Dano: 2x se for Super Tiro
                const dano = projetil.isSuperTiro ? 2 : 1; 
                inimigo.vida -= dano;
                
                if (inimigo.vida <= 0) {
                    inimigo.kill = true;
                    PONTOS += inimigo.pontuacaoMorte;
                }
            }
        });
        return !acertou && !projetil.kill;
    });
    
    // 6. Limpeza e Reconstrução do Array Principal
    inimigos = inimigos.filter(i => !i.kill);
    upgradesEstrela = upgradesEstrela.filter(u => !u.kill);
    curas = curas.filter(c => !c.kill);
    bigApples = bigApples.filter(a => !a.kill);

    // Reconstruir o array de todos os sprites para desenhar (incluindo bigApples)
    todosOsSprites = [...plataformas, jogador, ...inimigos, ...projeteis, ...curas, ...upgradesEstrela, ...bigApples];

    // 7. Game Over e Vitória
    if (jogador.vidaAtual <= 0) {
        exibirGameOver(); 
        return; 
    }
    
    if (venceu) {
        exibirWinScreen();
        return;
    }
}

function drawGame() {
    if (assets.fundo) {
        ctx.drawImage(assets.fundo, 0, 0, LARGURA, ALTURA);
    } else {
        ctx.fillStyle = BRANCO;
        ctx.fillRect(0, 0, LARGURA, ALTURA);
    }

    todosOsSprites.forEach(sprite => {
        ctx.save(); 
        sprite.draw();
        if (sprite instanceof Jogador) {
            sprite.drawBarraVida();
        }
        ctx.restore();
    });

    desenharUI();
}

function gameLoop() {
    if (ESTADO_JOGO === ESTADOS.RUNNING) {
        updateGame();
        drawGame();
        requestAnimationFrame(gameLoop);
    }
}

// Chamada inicial para iniciar a tela de START
window.onload = () => {
    startScreen.classList.remove('hidden');
    document.addEventListener('keydown', (e) => {
        if (ESTADO_JOGO === ESTADOS.START && e.key === 'Enter') {
            iniciarJogo();
        }
    });
};