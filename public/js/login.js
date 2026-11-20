
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";

import {
    getAuth,
    signInWithEmailAndPassword,
    signInWithPopup,
    createUserWithEmailAndPassword,
    updateProfile,
    GoogleAuthProvider,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyCIqQHAq1j_pTbnl46CsOiPBozOZix6z64",
    authDomain: "chamados-ti-c7a1c.firebaseapp.com",
    projectId: "chamados-ti-c7a1c",
    storageBucket: "chamados-ti-c7a1c.firebasestorage.app",
    messagingSenderId: "595991400654",
    appId: "1:595991400654:web:2aa642cba898cb3b3c809f",
    measurementId: "G-QZCWHL8N78"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Observa o estado de autenticação do Firebase.
// O acesso só é confirmado quando o servidor reconhece a sessão.
onAuthStateChanged(auth, async (usuario) => {
    if (!usuario) {
        return;
    }

    try {
        const resposta = await fetch("/auth/session", {
            method: "GET",
            credentials: "same-origin"
        });

        if (!resposta.ok) {
            return;
        }

        const sessao = await resposta.json();

        if (sessao.authenticated) {
            window.location.href = "/";
        }
    } catch (error) {
        console.error("Erro ao verificar sessão:", error);
    }
});

const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");
const googleButton = document.getElementById("google-login");

const errorElement = document.getElementById("login-error");
const loginOptions = document.getElementById("login-options");

const loginSwitch = document.getElementById("login-switch");
const registerSwitch = document.getElementById("register-switch");
const description = document.getElementById("form-description");

const showRegisterButton = document.getElementById("show-register");
const showLoginButton = document.getElementById("show-login");

// Envia o token do Firebase para o servidor validar
async function registrarUsuario(usuario, nome) {
    const token = await usuario.getIdToken();

    const resposta = await fetch("/auth/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token
        },
        body: JSON.stringify({
            nome: nome || usuario.displayName || ""
        })
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
        throw new Error(dados.erro || "Não foi possível registrar usuário.");
    }

    return dados;
}

// Alternar para cadastro
showRegisterButton.addEventListener("click", function () {
    loginForm.classList.add("hidden");
    registerForm.classList.remove("hidden");

    loginOptions.classList.add("hidden");
    loginSwitch.classList.add("hidden");
    registerSwitch.classList.remove("hidden");

    description.textContent = "Crie sua conta para acessar o sistema.";

    errorElement.textContent = "";
});

// Alternar para login
showLoginButton.addEventListener("click", function () {
    registerForm.classList.add("hidden");
    loginForm.classList.remove("hidden");

    loginOptions.classList.remove("hidden");
    registerSwitch.classList.add("hidden");
    loginSwitch.classList.remove("hidden");

    description.textContent = "Entre para acessar o sistema de suporte.";

    errorElement.textContent = "";
});

// Login com e-mail e senha
loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();
    errorElement.textContent = "";

    const email = document.getElementById("email").value.trim();
    const senha = document.getElementById("password").value;

    const button = document.getElementById("login-submit");
    button.disabled = true;
    button.textContent = "Entrando...";

    try {
        const resultado = await signInWithEmailAndPassword(
            auth,
            email,
            senha
        );

        await registrarUsuario(resultado.user);

        window.location.href = "/";

    } catch (error) {
        console.error("ERRO LOGIN:", error);
        errorElement.textContent = error.message;

    } finally {
        button.disabled = false;
        button.textContent = "Entrar";
    }
});

// Cadastro com e-mail e senha
registerForm.addEventListener("submit", async function (event) {
    event.preventDefault();
    errorElement.textContent = "";

    const nome = document.getElementById("register-name").value.trim();
    const email = document.getElementById("register-email").value.trim();
    const senha = document.getElementById("register-password").value;
    const confirmacao = document.getElementById("register-confirm").value;

    if (senha !== confirmacao) {
        errorElement.textContent = "As senhas não coincidem.";
        return;
    }

    const button = document.getElementById("register-submit");
    button.disabled = true;
    button.textContent = "Criando conta...";

    try {
        const resultado = await createUserWithEmailAndPassword(
            auth,
            email,
            senha
        );

        await updateProfile(resultado.user, {
            displayName: nome
        });

        await registrarUsuario(resultado.user, nome);

        window.location.href = "/";

    } catch (error) {
        console.error("ERRO CADASTRO:", error);
        errorElement.textContent = error.message;

    } finally {
        button.disabled = false;
        button.textContent = "Criar minha conta";
    }
});

// Login com Google
googleButton.addEventListener("click", async function () {
    errorElement.textContent = "";

    try {
        const resultado = await signInWithPopup(auth, provider);

        await registrarUsuario(resultado.user);

        window.location.href = "/";

    } catch (error) {
        console.error("ERRO GOOGLE:", error);
        errorElement.textContent = error.message;
    }
});

