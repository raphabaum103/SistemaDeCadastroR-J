// ==========================================
// AVISO: SUBSTITUA PELAS SUAS CHAVES REAIS
// ==========================================
const SUPABASE_URL = 'https://SEU_PROJECT_ID.supabase.co'; 
const SUPABASE_ANON_KEY = 'sb_publishable_jjq9FYBgowbIQUK85aTiKw_hbwDUeh4'; 

// Inicializa o cliente do Supabase a partir do objeto global disponibilizado pelo CDN
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Variável para controlar o estado do formulário (Login vs Cadastro)
let isLoginMode = true;

// ==========================================
// PROTEÇÃO DE ROTA (VERIFICAÇÃO DE SESSÃO)
// ==========================================
async function checkAuthSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    const currentPath = window.location.pathname;
    const isDashboard = currentPath.includes('dashboard.html');

    if (session) {
        // Usuário logado tentando acessar o index, manda pro dashboard
        if (!isDashboard) {
            window.location.href = 'dashboard.html';
        } else {
            // Atualiza a interface do dashboard com o email do usuário
            const userEmailDisplay = document.getElementById('user-email-display');
            if (userEmailDisplay) {
                userEmailDisplay.innerText = `Você está logado como: ${session.user.email}`;
            }
        }
    } else {
        // Usuário não logado tentando acessar o dashboard, manda pro index
        if (isDashboard) {
            window.location.href = 'index.html';
        }
    }
}

// Escuta mudanças no estado de autenticação (login, logout)
supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN') {
        window.location.href = 'dashboard.html';
    } else if (event === 'SIGNED_OUT') {
        window.location.href = 'index.html';
    }
});

// Executa a verificação inicial de rota assim que o script carrega
checkAuthSession();

// ==========================================
// LÓGICA DA PÁGINA DE LOGIN/CADASTRO
// ==========================================
const authForm = document.getElementById('auth-form');
const toggleBtn = document.getElementById('toggle-btn');

if (authForm) {
    // Alternar entre Login e Criar Conta
    toggleBtn.addEventListener('click', () => {
        isLoginMode = !isLoginMode;
        document.getElementById('form-title').innerText = isLoginMode ? 'Entrar' : 'Criar Conta';
        document.getElementById('submit-btn').innerText = isLoginMode ? 'Fazer Login' : 'Cadastrar';
        document.getElementById('toggle-text').innerText = isLoginMode ? 'Ainda não tem uma conta?' : 'Já possui uma conta?';
        toggleBtn.innerText = isLoginMode ? 'Criar Conta' : 'Fazer Login';
    });

    // Submissão do Formulário
    authForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        if (isLoginMode) {
            // Fazer Login
            const { data, error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) {
                alert(`Erro ao fazer login: ${error.message}`);
            } else {
                alert('Login efetuado com sucesso!');
            }
        } else {
            // Criar Conta
            const { data, error } = await supabase.auth.signUp({ email, password });
            if (error) {
                alert(`Erro ao criar conta: ${error.message}`);
            } else {
                alert('Conta criada com sucesso! Verifique seu e-mail para confirmar, se necessário, ou faça login.');
                // Retorna para o modo de login
                toggleBtn.click(); 
            }
        }
    });
}

// ==========================================
// LÓGICA DA PÁGINA DE DASHBOARD (LOGOUT)
// ==========================================
const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            alert(`Erro ao sair: ${error.message}`);
        }
    });
}