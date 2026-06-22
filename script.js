/* ========================================================
   AGENTIC AI PROMPT EVALUATOR · STAGE 3
   Robust Evaluation Logic with Context Patterns & Scoring
   ======================================================== */

(() => {
    'use strict';

    /* ─────────────────────────────────────────────────────
       CRITERIA ENGINE
       Each criterion has:
       - strongPatterns  → Regex indicating a STRONG match (2 points)
       - mediumPatterns  → Regex indicating a MEDIUM match (1 point)
       - threshold       → Minimum score for ✅ (default: 2)
       - maxScore        → Theoretically achievable points (for % display)
       ───────────────────────────────────────────────────── */
    const CRITERIA = [
        {
            id: 'rolle',
            name: 'Role & Persona',
            subtitle: 'Does your prompt define a clear role?',
            threshold: 2,
            maxScore: 6,
            strongPatterns: [
                /you\s+are\s+(a|an)\s+\w+/i,                              // "you are a [Role]"
                /act\s+as\s+(a|an)?\s*\w+/i,                              // "act as a [Role]"
                /your\s+role\s+is/i,                                      // "your role is"
                /take\s+(on\s+)?the\s+role\s+of/i,                        // "take on the role of"
                /behave\s+(like|as)\s+(a|an)?\s*\w+/i,                    // "behave like/as a [Role]"
                /assume\s+the\s+(role|persona|identity)\s+of/i,           // "assume the role of"
                /operate\s+as\s+(a|an)?\s*\w+/i,                          // "operate as a [Role]"
                /function\s+as\s+(a|an)?\s*\w+/i,                         // "function as a [Role]"
            ],
            mediumPatterns: [
                /expert\s+(in|on|at|for)/i,                               // "expert in/on"
                /specialist\s+(in|on|at|for)/i,                           // "specialist in/on"
                /speciali[sz]ed\s+(in|on|at|for)/i,                       // "specialized in"
                /senior\s+\w+/i,                                           // "Senior [Role]"
                /professional/i,                                           // "professional"
                /advisor|consultant/i,                                     // "advisor/consultant"
                /analyst/i,                                                // "analyst"
                /persona/i,                                                // "persona"
                /experienced\s+\w+/i,                                      // "experienced [Role]"
                /research.?agent/i,                                        // "Research-Agent"
                /assistant/i,                                              // "assistant"
                /engineer/i,                                               // "engineer"
            ],
            explanation: 'A clear role assignment forces the AI model into a specific mindset. Without a role, the agent works generically and delivers superficial results – like an intern without a job description.',
            example: '"You are an experienced Senior Research Agent, specialized in market analysis in the tech sector."',
            tipWeak: 'You hinted at a role, but it\'s still too vague. Make it more specific: What domain? How much experience? What communication style?',
            tipMissing: 'Your prompt has no role assignment. Start with: "You are a [job title], specialized in [domain]."'
        },
        {
            id: 'tools',
            name: 'Tool Permission',
            subtitle: 'Did you specify which tools may be used?',
            threshold: 2,
            maxScore: 6,
            strongPatterns: [
                /use\s+(the\s+)?\w+\s*tool/i,                             // "use the X tool"
                /utilize\s+(the\s+)?\w+/i,                                // "utilize the X"
                /employ\s+(the\s+)?\w+\s*tool/i,                          // "employ the X tool"
                /access\s+(the\s+)?\w+/i,                                 // "access the X"
                /leverage\s+(the\s+)?\w+/i,                               // "leverage the X"
                /only\s+use\s+/i,                                          // "only use"
                /exclusively\s+use\s+/i,                                   // "exclusively use"
                /(?:web|internet|google|bing|duckduckgo).?search/i,       // "WebSearch/internet search"
                /you\s+(?:may|can|should|shall|must)\s+use/i,             // "you may use"
                /you\s+have\s+access\s+to/i,                              // "you have access to"
            ],
            mediumPatterns: [
                /(?:web)?search/i,                                         // "WebSearch"
                /python/i,                                                 // "Python"
                /(?:code|programming).?(?:tool|environment)/i,            // "code tool"
                /api\b/i,                                                  // "API"
                /browser/i,                                                // "browser"
                /file\s*(?:system|access|manager)/i,                      // "file system"
                /calendar/i,                                               // "calendar"
                /e.?mail.?(?:tool|system|access)/i,                       // "email tool"
                /database/i,                                               // "database"
                /plugin|extension/i,                                       // "plugin"
                /scraping|crawl/i,                                         // technical terms
                /internet|online/i,                                        // "internet"
            ],
            explanation: 'An agent carries tools in its backpack – web search, Python, email, file system, etc. Without explicit permission, it hallucinates facts instead of looking them up, or uses the wrong tool.',
            example: '"Use exclusively the WebSearch tool and the Python analysis tool for your research."',
            tipWeak: 'You mentioned tools, but be more precise: WHICH tools exactly may the agent use and for WHAT purpose?',
            tipMissing: 'Your prompt doesn\'t define which tools the agent may use. Add: "Use [tool name] for [task]."'
        },
        {
            id: 'guardrails',
            name: 'Guardrails / Boundaries',
            subtitle: 'Did you set limits on what is NOT allowed?',
            threshold: 2,
            maxScore: 6,
            strongPatterns: [
                /(?:you\s+)?(?:must|should|shall)\s+(?:not|never)\b/i,    // "you must not/never"
                /(?:do\s+)?not\s+(?:ever\s+)?(?:send|delete|buy|purchase|execute|modify|change)/i, // "do not send/delete"
                /(?:never|don'?t)\s+\w+\s+without\s+(?:my\s+)?(?:approval|permission|consent|confirmation)/i,
                /under\s+no\s+circumstances/i,                             // "under no circumstances"
                /strictly\s+(?:forbidden|prohibited)/i,                   // "strictly forbidden"
                /human.?in.?the.?loop/i,                                   // "Human-in-the-Loop"
                /wait\s+(?:for\s+)?(?:my\s+)?(?:approval|confirmation|permission)/i,
                /only\s+(?:after|with)\s+(?:my\s+)?(?:explicit\s+)?(?:approval|permission|confirmation|consent)/i,
                /without\s+(?:my\s+)?(?:explicit\s+)?(?:approval|permission|consent)/i,
                /(?:it\s+is\s+)?(?:absolutely\s+)?(?:forbidden|prohibited)\s+to/i,
            ],
            mediumPatterns: [
                /approval/i,                                               // "approval"
                /permission/i,                                             // "permission"
                /consent/i,                                                // "consent"
                /confirmation/i,                                           // "confirmation"
                /(?:only|exclusively)\s+(?:with|after)\s+/i,              // "only with/after"
                /prohibit|forbid/i,                                        // "prohibit/forbid"
                /restriction|limitation/i,                                 // "restriction"
                /boundary|limit|constraint/i,                             // "boundary/limit"
                /safety|security/i,                                        // "safety"
                /guardrail/i,                                              // "guardrail"
                /oversight|supervisi/i,                                    // "oversight/supervision"
                /off.?limits/i,                                            // "off-limits"
            ],
            explanation: 'Guardrails are like brakes in a car – without them, the agent is an uncontrollable machine. They define what it must NOT do: no emails without approval, no deletions, no purchases.',
            example: '"You must never send emails or make purchases on your own without my explicit approval."',
            tipWeak: 'You hinted at restrictions, but define concrete prohibitions. What must the agent NEVER do?',
            tipMissing: 'Your prompt has no safety boundaries! Add: "You must never [critical action] without my approval."'
        },
        {
            id: 'abbruch',
            name: 'Abort Condition',
            subtitle: 'Did you define when the agent should stop?',
            threshold: 2,
            maxScore: 6,
            strongPatterns: [
                /(?:a\s+)?maximum\s+(?:of\s+)?\d+/i,                      // "a maximum of 5"
                /at\s+most\s+\d+/i,                                        // "at most 10"
                /no\s+more\s+than\s+\d+/i,                                // "no more than 5"
                /(?:after|upon)\s+\d+\s+(?:attempt|failure|iteration|request|step|trie)/i,
                /stop\s+(?:after|at|automatically|immediately|the\s+process)/i,
                /abort\s+(?:after|at|when|if)/i,                           // "abort after"
                /terminate\s+(?:the|after|automatically)/i,               // "terminate the process"
                /limit\s+(?:to|the|yourself)\s+\d*/i,                     // "limit to X"
                /stop\s+after\s+\d+/i,                                    // "stop after X"
                /perform\s+(?:a\s+)?max(?:imum)?\s+(?:of\s+)?\d+/i,      // "perform max 5"
                /(?:up\s+to|not\s+exceed)\s+\d+/i,                        // "up to 5"
            ],
            mediumPatterns: [
                /abort/i,                                                  // "abort"
                /stop|halt|cease/i,                                        // "stop"
                /iteration|cycle|round/i,                                  // "iteration"
                /attempt(?:s)?/i,                                          // "attempts"
                /limited|cap(?:ped)?|upper\s*bound/i,                     // "limited"
                /infinite\s*loop/i,                                        // "infinite loop"
                /timeout/i,                                                // "timeout"
                /budget/i,                                                 // "budget"
                /cost\s*(?:limit|cap|ceiling)/i,                          // "cost limit"
                /automatically\s+(?:stop|end|abort|terminate)/i,          // "automatically stop"
                /then\s+(?:stop|end|abort|terminate|quit)/i,              // "then stop"
            ],
            explanation: 'Without an abort condition, an agent can fall into expensive infinite loops – "until it\'s perfect" means for a machine: never stop. Clear limits protect against uncontrolled costs.',
            example: '"Perform a maximum of 5 search queries and then stop automatically."',
            tipWeak: 'You mentioned aborting, but define a specific NUMBER: How many attempts/iterations at most?',
            tipMissing: 'Your prompt has no abort condition! Add: "Perform a maximum of [number] attempts. Stop automatically after that."'
        },
        {
            id: 'react',
            name: 'ReAct Format',
            subtitle: 'Must the agent make its thinking transparent?',
            threshold: 2,
            maxScore: 6,
            strongPatterns: [
                /before\s+you\s+(?:use\s+a\s+tool|act|take\s+action|proceed|execute)/i,  // "before you act"
                /explain\s+(?:me\s+)?(?:your\s+)?(?:reasoning|thinking|thought\s+process|rationale)/i,
                /think\s+(?:out\s+)?(?:loud|aloud)/i,                     // "think out loud"
                /step\s+by\s+step/i,                                       // "step by step"
                /show\s+(?:me\s+)?(?:your\s+)?(?:thought\s+process|reasoning|thinking|rationale|approach)/i,
                /reason(?:ing)?\s*(?:→|->|,|and|then)\s*act/i,            // "Reason → Act"
                /chain.?of.?thought/i,                                     // "Chain-of-Thought"
                /think\s+step\s+by\s+step/i,                              // "think step by step"
                /justify\s+(?:your\s+)?(?:every|each|the)?\s*(?:decision|action|step|choice)/i,
                /make\s+(?:your\s+)?(?:thought\s+process|reasoning|thinking)\s+transparent/i,
            ],
            mediumPatterns: [
                /transparent/i,                                            // "transparent"
                /traceable|comprehensible/i,                               // "traceable"
                /reasoning/i,                                              // "reasoning"
                /react\b/i,                                                // "ReAct" (exact)
                /thought\s*process/i,                                      // "thought process"
                /train\s+of\s+thought/i,                                   // "train of thought"
                /justif/i,                                                 // "justify/justification"
                /explain\s+(me|why|what|how)\b/i,                         // "explain why"
                /(?:consider|plan)\w*\s+(?:before|first|ahead)/i,         // "consider first"
                /describe\s+(?:your\s+)?(?:plan|approach|strategy)/i,
                /document\s+(?:your|every|each)/i,                        // "document your"
                /observe|reflect/i,                                        // "observe/reflect"
            ],
            explanation: 'The ReAct format (Reason → Act → Observe) forces the agent to think out loud. Without transparency, the agent is a black box – you see the result, but not WHY it decided that way.',
            example: '"Before you use a tool, explain your reasoning in one sentence and what you will do next."',
            tipWeak: 'You require transparency, but explicitly ask the agent to disclose its thinking BEFORE it acts.',
            tipMissing: 'Your prompt requires no transparency! Add: "Before you act, explain your reasoning and your planned action."'
        },
        {
            id: 'fehler',
            name: 'Error Handling',
            subtitle: 'Is there a Plan B for errors?',
            threshold: 2,
            maxScore: 6,
            strongPatterns: [
                /if\s+.{0,30}(?:fails?|doesn'?t\s+work|is\s+(?:not\s+)?(?:possible|available|successful))/i,
                /in\s+case\s+(?:of\s+)?(?:an?\s+)?(?:error|failure|problem)/i,
                /(?:error|failure).?(?:handling|management|recovery)/i,    // "error handling"
                /alternative\s+(?:strategy|source|approach|method|solution|search)/i,
                /plan\s*b\b/i,                                              // "Plan B"
                /backup\s*(?:plan|strategy|solution)/i,                   // "backup plan"
                /(?:try|catch|fallback|retry)/i,                           // technical terms
                /(?:after|upon)\s+\d+\s+(?:failed\s+attempt|failure)/i,   // "after 3 failed attempts"
                /try\s+again/i,                                            // "try again"
                /when\s+.{0,20}(?:fails?|errors?)/i,                      // "when ... fails"
                /(?:fall\s*back|resort)\s+to/i,                            // "fall back to"
            ],
            mediumPatterns: [
                /error\b/i,                                                // "error"
                /failure/i,                                                // "failure"
                /alternative/i,                                            // "alternative"
                /(?:if|when)\s+(?:it\s+)?(?:doesn'?t|does\s+not|cannot)/i, // "if it doesn't"
                /otherwise|else\b/i,                                       // "otherwise"
                /(?:notify|inform|alert)\s+(?:me|the\s+user)/i,
                /abort|terminate/i,                                        // also relevant here
                /(?:problem|difficulty|obstacle|issue)/i,                  // "problem"
                /(?:error|failure)\s*(?:message|report|notification)/i,   // "error message"
                /workaround/i,                                             // "workaround"
                /(?:can(?:'?t|not)|could\s+not|unable\s+to)/i,           // "cannot/unable to"
                /graceful/i,                                               // "gracefully"
            ],
            explanation: 'Agents operate in uncertain environments – downloads fail, APIs don\'t respond, data is faulty. Without error handling, the agent gets stuck or delivers empty results.',
            example: '"If a search query fails, try an alternative search formulation. After the third failed attempt, abort and inform me."',
            tipWeak: 'You mentioned errors, but define a concrete plan: What happens on the 1st error? The 2nd? The 3rd?',
            tipMissing: 'Your prompt has no error handling! Add: "If [action] fails, try [alternative]. After [X] failed attempts, abort."'
        }
    ];

    const EXAMPLE_PROMPT = `You are an experienced Senior Research Agent, specialized in market analysis in the tech sector. Use exclusively the WebSearch tool and the Python analysis tool for your research. You must never send emails or make purchases on your own without my explicit approval. Perform a maximum of 5 search queries and then stop automatically. Before you use a tool, explain your reasoning in one sentence and what you will do next. If a search query fails or returns no relevant results, try an alternative search formulation. After the third failed attempt, abort and inform me about the issues.`;

    // ─── DOM Elements ───
    const promptInput = document.getElementById('promptInput');
    const charCount = document.getElementById('charCount');
    const btnEvaluate = document.getElementById('btnEvaluate');
    const btnExample = document.getElementById('btnExample');
    const btnReset = document.getElementById('btnReset');
    const btnRetry = document.getElementById('btnRetry');
    const progressSection = document.getElementById('progressSection');
    const progressFill = document.getElementById('progressFill');
    const progressValue = document.getElementById('progressValue');
    const resultsSection = document.getElementById('resultsSection');
    const scoreBadge = document.getElementById('scoreBadge');
    const scoreEmoji = document.getElementById('scoreEmoji');
    const scoreNumber = document.getElementById('scoreNumber');
    const scoreLabel = document.getElementById('scoreLabel');
    const scoreSublabel = document.getElementById('scoreSublabel');
    const criteriaGrid = document.getElementById('criteriaGrid');
    const retryCta = document.getElementById('retryCta');

    // ─── State ───
    let isEvaluating = false;

    // ─── Initialize ───
    function init() {
        promptInput.addEventListener('input', onInputChange);
        btnEvaluate.addEventListener('click', evaluatePrompt);
        btnExample.addEventListener('click', loadExample);
        btnReset.addEventListener('click', resetAll);
        btnRetry.addEventListener('click', scrollToPromptAndEvaluate);
        updateCharCount();
    }

    // ─── Input Handling ───
    function onInputChange() {
        updateCharCount();
        updateEvaluateButton();
    }

    function updateCharCount() {
        const len = promptInput.value.length;
        charCount.textContent = `${len} characters`;
    }

    function updateEvaluateButton() {
        btnEvaluate.disabled = promptInput.value.trim().length < 10;
    }

    // ─── Load Example ───
    function loadExample() {
        promptInput.value = EXAMPLE_PROMPT;
        promptInput.focus();
        onInputChange();

        // Highlight effect
        promptInput.style.transition = 'box-shadow 0.3s';
        promptInput.parentElement.style.boxShadow = '0 0 30px rgba(0, 212, 170, 0.15)';
        setTimeout(() => {
            promptInput.parentElement.style.boxShadow = '';
        }, 800);
    }

    // ─── Reset ───
    function resetAll() {
        promptInput.value = '';
        onInputChange();
        resultsSection.classList.remove('visible');
        progressSection.classList.remove('visible');
        progressFill.style.width = '0%';
        criteriaGrid.innerHTML = '';
        scoreBadge.className = 'score-badge';
        promptInput.focus();
    }

    // ─── Scroll to Prompt & Re-evaluate ───
    function scrollToPromptAndEvaluate() {
        promptInput.focus();
        promptInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    /* ──────────────────────────────────────────────────────
       CORE EVALUATION ENGINE
       Scoring: 0 = miss, 1 = weak, 2 = pass, 3 = strong
       ────────────────────────────────────────────────────── */

    function evaluateCriterion(text, criterion) {
        let score = 0;
        const matchedStrong = [];
        const matchedMedium = [];

        // Check strong patterns (2 points each, capped contribution)
        for (const pattern of criterion.strongPatterns) {
            const match = text.match(pattern);
            if (match) {
                score += 2;
                matchedStrong.push(match[0].trim());
            }
        }

        // Check medium patterns (1 point each)
        for (const pattern of criterion.mediumPatterns) {
            const match = text.match(pattern);
            if (match) {
                score += 1;
                matchedMedium.push(match[0].trim());
            }
        }

        // Determine quality level
        let quality; // 'strong' | 'pass' | 'weak' | 'miss'
        if (score >= 4 && matchedStrong.length >= 1) {
            quality = 'strong';
        } else if (score >= criterion.threshold) {
            quality = 'pass';
        } else if (score >= 1) {
            quality = 'weak';
        } else {
            quality = 'miss';
        }

        return {
            ...criterion,
            score,
            quality,
            passed: quality === 'strong' || quality === 'pass',
            matchedStrong,
            matchedMedium
        };
    }

    // ─── Evaluate Prompt ───
    async function evaluatePrompt() {
        if (isEvaluating || promptInput.value.trim().length < 10) return;
        isEvaluating = true;

        const text = promptInput.value;

        // Show loading state
        btnEvaluate.classList.add('loading');
        btnEvaluate.disabled = true;

        // Reset & show progress
        resultsSection.classList.remove('visible');
        criteriaGrid.innerHTML = '';
        progressFill.style.width = '0%';
        progressValue.textContent = '0 / 6';
        progressSection.classList.add('visible');

        // Evaluate each criterion with staggered animation
        const results = [];
        for (let i = 0; i < CRITERIA.length; i++) {
            const criterion = CRITERIA[i];
            const result = evaluateCriterion(text, criterion);
            results.push(result);

            // Update progress
            await delay(350);
            const progress = ((i + 1) / CRITERIA.length) * 100;
            progressFill.style.width = `${progress}%`;
            progressValue.textContent = `${i + 1} / 6`;

            // Add criterion card
            addCriterionCard(result, i);
        }

        // Calculate score (count passed criteria)
        const passedCount = results.filter(r => r.passed).length;
        // Calculate total quality score (for the sub-label)
        const totalScore = results.reduce((sum, r) => sum + Math.min(r.score, r.maxScore), 0);
        const maxPossible = results.reduce((sum, r) => sum + r.maxScore, 0);

        // Short pause then reveal score
        await delay(500);

        // Hide progress, show results
        progressSection.classList.remove('visible');
        showScore(passedCount, totalScore, maxPossible);
        resultsSection.classList.add('visible');

        // Scroll to results
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

        // Reset button state
        btnEvaluate.classList.remove('loading');
        btnEvaluate.disabled = false;
        isEvaluating = false;
    }

    // ─── Add Criterion Card ───
    function addCriterionCard(result, index) {
        const card = document.createElement('div');

        // Map quality to CSS class
        const qualityClass = result.passed ? 'pass' : 'fail';
        card.className = `criterion-card ${qualityClass}`;

        // Status emoji based on quality
        let statusEmoji, qualityLabel;
        switch (result.quality) {
            case 'strong':
                statusEmoji = '✅';
                qualityLabel = '🌟 Strong – Excellently implemented!';
                break;
            case 'pass':
                statusEmoji = '✅';
                qualityLabel = '👍 Detected – Fundamentally present.';
                break;
            case 'weak':
                statusEmoji = '⚠️';
                qualityLabel = '⚡ Weak – Only hinted at, not yet sufficient.';
                break;
            case 'miss':
            default:
                statusEmoji = '❌';
                qualityLabel = '🚫 Missing – Not found in your prompt.';
                break;
        }

        // Build feedback HTML
        let feedbackHTML = '';
        if (!result.passed) {
            const tip = result.quality === 'weak' ? result.tipWeak : result.tipMissing;
            feedbackHTML = `
                <div class="criterion-feedback">
                    <div class="feedback-block">
                        <div class="quality-label">${qualityLabel}</div>
                        <div class="feedback-title">Why is this important?</div>
                        <p class="feedback-text">${result.explanation}</p>
                        <div class="feedback-title" style="margin-top:12px;">💡 Tip for improvement:</div>
                        <p class="feedback-text">${tip}</p>
                        <div class="feedback-example-label">✨ Example phrasing</div>
                        <div class="feedback-example">${result.example}</div>
                    </div>
                </div>
            `;
        } else {
            // Show positive feedback for passed criteria too
            let matchInfo = '';
            if (result.matchedStrong.length > 0) {
                matchInfo = `<span class="match-highlight">Detected phrases: "${result.matchedStrong.slice(0, 3).join('", "')}"</span>`;
            }
            feedbackHTML = `
                <div class="criterion-feedback criterion-feedback--positive">
                    <div class="quality-label">${qualityLabel}</div>
                    ${matchInfo}
                </div>
            `;
        }

        card.innerHTML = `
            <div class="criterion-header">
                <div class="criterion-status">${statusEmoji}</div>
                <div class="criterion-info">
                    <div class="criterion-name">${result.name}</div>
                    <div class="criterion-subtitle">${result.subtitle}</div>
                </div>
            </div>
            ${feedbackHTML}
        `;

        criteriaGrid.appendChild(card);

        // Trigger staggered animation
        requestAnimationFrame(() => {
            setTimeout(() => {
                card.classList.add('revealed');
            }, 50);
        });
    }

    // ─── Show Score ───
    function showScore(passedCount, totalScore, maxPossible) {
        scoreNumber.textContent = `${passedCount} / 6`;
        const percent = Math.round((totalScore / maxPossible) * 100);
        scoreSublabel.textContent = `${passedCount} of 6 criteria met · Quality: ${percent}%`;

        if (passedCount >= 5) {
            scoreBadge.className = 'score-badge pass';
            scoreEmoji.textContent = '🌟';
            scoreLabel.textContent = 'PASSED';
        } else if (passedCount >= 3) {
            scoreBadge.className = 'score-badge partial';
            scoreEmoji.textContent = '⚠️';
            scoreLabel.textContent = 'PARTIAL';
        } else {
            scoreBadge.className = 'score-badge fail';
            scoreEmoji.textContent = '❌';
            scoreLabel.textContent = 'NEEDS WORK';
        }
    }

    // ─── Utility ───
    function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // ─── Boot ───
    init();
})();
