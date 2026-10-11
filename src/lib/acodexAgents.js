/**
 * AcodeX IA — Copyright (c) 2026 mlk010173.
 * Licensed under the AcodeX IA License — see LICENSE-ACODEX-IA.
 * Personal and non-commercial use is allowed with attribution.
 * Any other use, copying, modification or distribution requires
 * prior written permission from the copyright holder.
 */

/**
 * AcodeX IA — REGISTRO ÚNICO DE AGENTES
 *
 * Este é o único ponto de cadastro de agentes do AcodeX IA.
 * Para adicionar um novo agente (de qualquer origem), basta criar
 * uma nova entrada neste objeto. Nada mais precisa ser alterado:
 * o seletor (comando "acodex-ai") lê tudo daqui automaticamente.
 *
 * Campos de cada entrada:
 *  - name:        nome exibido no seletor
 *  - kind:        "cli" (roda no sandbox) | "api" (fala com um serviço externo)
 *  - tier:        "free" (open-source/grátis) | "freemium" (tem plano grátis)
 *                 | "paid" (pago)
 *  - status:      "ativo" (pronto) | "provisorio" (requer chave/assinatura
 *                 do próprio usuário — pode deixar pra depois)
 *  - bin:         comando que inicia o agente (kind "cli")
 *  - install:     comando shell que instala o agente no sandbox
 *  - script:      nome do helper instalado no sandbox (kind "api")
 *  - description: texto curto exibido no seletor
 *  - note:        aviso curto sobre chave/requisito, se houver
 */

/** @type {Record<string, object>} */
export const AGENT_REGISTRY = {
	"base44-superagent": {
		name: "Base44 Superagent",
		kind: "api",
		tier: "freemium",
		status: "ativo",
		script: "acodex-b44",
		description: "Superagent da Base44 (sandbox, git, navegador, automações)",
		note: "requer ACODEX_BASE44_KEY (grátis com créditos, planos pagos depois)",
	},
	"gemini-cli": {
		name: "Gemini CLI",
		kind: "cli",
		tier: "freemium",
		status: "ativo",
		bin: "gemini",
		install: "npm install -g @google/gemini-cli",
		description: "Google AI coding agent (tem tier grátis)",
	},
	"opencode": {
		name: "OpenCode",
		kind: "cli",
		tier: "free",
		status: "ativo",
		bin: "opencode",
		install: "npm install -g opencode-ai",
		description: "Coding agent open-source (chave própria)",
	},
	"crush": {
		name: "Crush",
		kind: "cli",
		tier: "free",
		status: "ativo",
		bin: "crush",
		install: "npm install -g @charmbracelet/crush",
		description: "Coding agent open-source da Charm",
	},
	"aider": {
		name: "Aider",
		kind: "cli",
		tier: "free",
		status: "ativo",
		bin: "aider",
		install:
			"apk add -q python3 py3-pip >/dev/null 2>&1; python3 -m pip install --break-system-packages aider-chat",
		description: "AI pair programming open-source (Python)",
	},
	"claude-code": {
		name: "Claude Code",
		kind: "cli",
		tier: "paid",
		status: "provisorio",
		bin: "claude",
		install: "npm install -g @anthropic-ai/claude-code",
		description: "Anthropic coding agent (assinatura ou API paga)",
		note: "pago — funciona quando você tiver a chave/conta",
	},
	"codex": {
		name: "OpenAI Codex",
		kind: "cli",
		tier: "paid",
		status: "provisorio",
		bin: "codex",
		install: "npm install -g @openai/codex",
		description: "OpenAI coding agent (plano pago)",
		note: "pago — funciona quando você tiver a chave/conta",
	},
};

/** Marca exibida no seletor para cada tier. */
export const TIER_LABEL = {
	free: "open-source/grátis",
	freemium: "tem tier grátis",
	paid: "pago (provisório)",
};

/**
 * Instala o helper do agente de API no sandbox do terminal.
 * Discreto: um único script, sem alterar nada mais no sistema.
 * @param {object} agent Entrada do registro com kind "api"
 * @returns {string} Comando shell que garante o helper instalado
 */
export function buildApiHelperInstall(agent) {
	return `command -v ${agent.script} >/dev/null 2>&1 || { cat > /usr/local/bin/${agent.script} <<'ACODEX_B44_EOF'
#!/bin/sh
# acodex-b44 — fala com um Superagent Base44 direto do terminal do AcodeX
# Uso: acodex-b44 "faça X no meu código"
# Requer: export ACODEX_BASE44_KEY="sua chave" (Settings > API no editor do agente)
BASE="\${ACODEX_BASE44_URL:-https://app.base44.com/api/agents}"
AGENT="\${ACODEX_BASE44_AGENT:-6ac03c4c0177787eb59621ed}"
KEY="\${ACODEX_BASE44_KEY:-}"
if [ -z "\$KEY" ]; then
  echo "acodex-b44: defina ACODEX_BASE44_KEY (chave de API do seu agente Base44)"
  exit 1
fi
MSG="\$1"; [ -z "\$MSG" ] && { echo "uso: acodex-b44 \\"mensagem para o agente\\""; exit 1; }
CONV="\${ACODEX_BASE44_CONV:-}"
if [ -z "\$CONV" ]; then
  CONV=\$(curl -s -X POST "\$BASE/\$AGENT/conversations" -H "api_key: \$KEY" -H "Content-Type: application/json" -d '{"title":"AcodeX"}' | sed -n 's/.*"id"[[:space:]]*:[[:space:]]*"\\([^"]*\\)".*/\\1/p' | head -n1)
  if [ -n "\$CONV" ]; then echo "(conversa \$CONV criada; export ACODEX_BASE44_CONV=\$CONV pra continuar na mesma)"; fi
fi
if [ -z "\$CONV" ]; then
  echo "acodex-b44: nao consegui criar/obter conversa — confira a chave e o id do agente"
  exit 1
fi
curl -s -X POST "\$BASE/\$AGENT/conversations/\$CONV/messages" -H "api_key: \$KEY" -H "Content-Type: application/json" -d "{\\"message\\":\\"\$MSG\\"}"
echo ""
ACODEX_B44_EOF
chmod +x /usr/local/bin/${agent.script}; }`;
}
