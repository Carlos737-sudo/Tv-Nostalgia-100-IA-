document.addEventListener("DOMContentLoaded", () => {

    const formulario = document.querySelector(".login form");
    const nomeInput = document.getElementById("nome");
    const codigoInput = document.getElementById("codigo");
    const mensagem = document.getElementById("mensagem");

    const login = document.querySelector(".login");
    const app = document.getElementById("app");
    const boasVindas = document.getElementById("boas-vindas");
    const botaoContinuar = document.getElementById("botaoContinuar");

    const codigoCorreto = "lilas";

    function pulsar(botao) {
        botao.classList.add("pulsando");
        setTimeout(() => botao.classList.remove("pulsando"), 500);
    }

    function criarRipple(evento, botao) {
        const antigo = botao.querySelector(".ripple");
        if (antigo) antigo.remove();

        const raio = Math.max(botao.clientWidth, botao.clientHeight);
        const rect = botao.getBoundingClientRect();

        const ripple = document.createElement("span");
        ripple.classList.add("ripple");
        ripple.style.width = `${raio}px`;
        ripple.style.height = `${raio}px`;
        ripple.style.left = `${evento.clientX - rect.left - raio / 2}px`;
        ripple.style.top = `${evento.clientY - rect.top - raio / 2}px`;

        botao.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);
    }

    formulario.addEventListener("submit", (event) => {
        event.preventDefault();
        pulsar(botaoContinuar);

        const nome = nomeInput.value.trim();
        const codigo = codigoInput.value.trim();

        if (nome === "") {
            mensagem.textContent = "Digite seu nome.";
            return;
        }

        if (codigo !== codigoCorreto) {
            mensagem.textContent = "Código de acesso incorreto.";
            codigoInput.value = "";
            codigoInput.focus();
            return;
        }

        mensagem.textContent = "Login realizado com sucesso!";
        boasVindas.textContent = `Bem-vindo, ${nome}!`;

        login.classList.add("saindo");

        setTimeout(() => {
            login.style.display = "none";
            app.classList.remove("oculto");
            irParaTela("fotos");
        }, 400);
    });

    botaoContinuar.addEventListener("click", (event) => {
        criarRipple(event, botaoContinuar);
    });

    const abas = document.querySelectorAll(".aba");
    const telas = document.querySelectorAll(".tela");

    function irParaTela(nomeTela) {
        telas.forEach((tela) => {
            tela.classList.toggle("oculto", tela.dataset.tela !== nomeTela);
        });

        abas.forEach((aba) => {
            aba.classList.toggle("ativa", aba.dataset.tela === nomeTela);
        });

        if (nomeTela === "placar") {
            renderizarPlacar();
        }
    }

    abas.forEach((aba) => {
        aba.addEventListener("click", (event) => {
            pulsar(aba);
            criarRipple(event, aba);
            irParaTela(aba.dataset.tela);
        });
    });

    const botaoJaViu = document.getElementById("botaoJaViu");

    botaoJaViu.addEventListener("click", (event) => {
        pulsar(event.currentTarget);
        criarRipple(event, event.currentTarget);
        irParaTela("votar");
    });

    function criarAvatar(personagem) {
        if (personagem.foto && personagem.foto.trim() !== "") {
            return `
                <div class="avatar" style="background: linear-gradient(160deg, ${personagem.cor}, #1a1207);">
                    <img src="${personagem.foto}" alt="${personagem.nome}">
                </div>
            `;
        }

        return `
            <div class="avatar" style="background: linear-gradient(160deg, ${personagem.cor}, #1a1207);">
                ${personagem.iniciais}
            </div>
        `;
    }

    const gradeFotos = document.getElementById("grade-fotos");

    function renderizarFotos() {
        gradeFotos.innerHTML = PERSONAGENS.map((p) => `
            <div class="cartao-foto">
                ${criarAvatar(p)}
                <h3>${p.nome}</h3>
                <p class="categoria">${p.categoria}</p>
                <p class="periodo">${p.periodo}</p>
                <button type="button" class="botao-detalhe">Ver detalhes</button>
            </div>
        `).join("");

        gradeFotos.querySelectorAll(".botao-detalhe").forEach((botao, indice) => {
            botao.addEventListener("click", () => {
                const p = PERSONAGENS[indice];
                alert(`${p.nome}\n${p.categoria} — ${p.periodo}`);
            });
        });
    }

    const gradeVotar = document.getElementById("grade-votar");
    const botaoConfirmarVoto = document.getElementById("botaoConfirmarVoto");
    const CHAVE_JA_VOTOU = "tvNostalgica_jaVotou";
    let idSelecionado = null;

    function jaVotou() {
        return localStorage.getItem(CHAVE_JA_VOTOU) === "sim";
    }

    function renderizarVotar() {
        gradeVotar.innerHTML = PERSONAGENS.map((p) => `
            <div class="cartao-votar" data-id="${p.id}" role="button" tabindex="0">
                <span class="selo-selecionado">&#10003; Selecionado</span>
                ${criarAvatar(p)}
                <h3>${p.nome}</h3>
                <p class="categoria">${p.categoria}</p>
                <p class="periodo">${p.periodo}</p>
                <button type="button" class="botao-escolher">Escolher</button>
            </div>
        `).join("");

        gradeVotar.querySelectorAll(".cartao-votar").forEach((cartao) => {
            cartao.addEventListener("click", () => selecionarPersonagem(cartao.dataset.id));
        });

        if (jaVotou()) {
            botaoConfirmarVoto.textContent = "Voto já registrado";
            botaoConfirmarVoto.disabled = true;
        }
    }

    function selecionarPersonagem(id) {
        if (jaVotou()) return;

        idSelecionado = id;

        gradeVotar.querySelectorAll(".cartao-votar").forEach((cartao) => {
            cartao.classList.toggle("selecionado", cartao.dataset.id === id);
        });
    }

    botaoConfirmarVoto.addEventListener("click", (event) => {
        if (jaVotou()) return;

        if (!idSelecionado) {
            alert("Escolha um personagem antes de confirmar o voto.");
            return;
        }

        pulsar(botaoConfirmarVoto);
        criarRipple(event, botaoConfirmarVoto);

        const personagem = PERSONAGENS.find((p) => p.id === idSelecionado);
        personagem.votos += 1;

        localStorage.setItem(CHAVE_JA_VOTOU, "sim");
        botaoConfirmarVoto.textContent = "Voto já registrado";
        botaoConfirmarVoto.disabled = true;

        mostrarMensagemVoto(`Voto em ${personagem.nome} registrado. Obrigado por participar!`);

        setTimeout(() => irParaTela("placar"), 900);
    });

    function mostrarMensagemVoto(texto) {
        const aviso = document.querySelector(".aviso-voto span:last-child");
        if (aviso) aviso.textContent = texto;
    }

    const podio = document.getElementById("podio");
    const listaClassificacao = document.getElementById("lista-classificacao");

    function renderizarPlacar() {
        const ordenados = [...PERSONAGENS].sort((a, b) => b.votos - a.votos);
        const topTres = ordenados.slice(0, 3);
        const maiorVotos = ordenados.length > 0 ? ordenados[0].votos : 0;

        const classes = ["ouro", "prata", "bronze"];
        const medalhas = ["1", "2", "3"];

        podio.innerHTML = topTres.map((p, indice) => `
            <div class="pedestal ${classes[indice]}">
                <span class="medalha">${medalhas[indice]}</span>
                ${criarAvatar(p)}
                <h3>${p.nome}</h3>
                <p class="votos">${p.votos.toLocaleString("pt-BR")}</p>
                <p class="votos-label">votos</p>
                <div class="base"></div>
            </div>
        `).join("");

        listaClassificacao.innerHTML = ordenados.map((p, indice) => {
            const posicao = indice + 1;
            const classePosicao = posicao === 1 ? "top1" : posicao === 2 ? "top2" : posicao === 3 ? "top3" : "";
            const largura = maiorVotos > 0 ? Math.max(6, Math.round((p.votos / maiorVotos) * 100)) : 6;

            return `
                <li class="item-classificacao">
                    <span class="posicao ${classePosicao}">${posicao}</span>
                    <span class="nome">${p.nome}</span>
                    <span class="qtd-votos">${p.votos.toLocaleString("pt-BR")} votos</span>
                    <div class="barra-fundo">
                        <div class="barra-preenchida" style="width: ${largura}%"></div>
                    </div>
                </li>
            `;
        }).join("");
    }

    renderizarFotos();
    renderizarVotar();
    renderizarPlacar();

});
