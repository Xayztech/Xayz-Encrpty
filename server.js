const express = require('express');
const JsConfuser = require('js-confuser');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

app.use((req, res, next) => {
    const ua = (req.get('User-Agent') || '').toLowerCase();
    
    const blockedAgents = [
        'curl', 'wget', 'python', 'libwww', 'httpunit', 'nmap', 'sqlmap', 
        'bot', 'crawler', 'spider', 'robot', 'headless', 'puppeteer', 
        'selenium', 'playwright', 'axios', 'postman', 'insomnia'
    ];

    const isBlocked = blockedAgents.some(agent => ua.includes(agent));

    if (isBlocked) {
        console.log(`[SECURITY] BLOCKED IP: ${req.ip} | UA: ${ua}`);
        return res.status(403).send(`
            <html>
                <body style="background:black; color:red; text-align:center; padding-top:20%;">
                    <h1>⛔ ACCESS DENIED ⛔</h1>
                    <p>Security System: Anti-Bot Protocol Activated.</p>
                    <p>Your IP has been logged.</p>
                </body>
            </html>
        `);
    }
    next();
});

app.use(express.static(path.join(__dirname, 'public')));

const VORTEX_GUARD_V12 = `
(function(globalRoot, factory) {
    if (typeof exports === 'object' && typeof module !== 'undefined') {
        factory(global, true);
    } else {
        factory(window, false);
    }
})(this, function(g, isNode) {
    const _p = g.process || {};
    const _c = g.console || {};
    
    // --- FUNGSI MENGHANCURKAN MEMORI JIKA TERDETEKSI ---
    const _secureCrash = (reason) => {
        if(g.__DEAD) return; 
        g.__DEAD = true;
        
        // Memory Bomb (Memenuhi RAM)
        const bomb = () => { 
            try { 
                while(true) { 
                    new Array(10000000).fill('DEAD MEMORY ALLOCATION ' + Math.random()); 
                } 
            } catch(e){} 
        };
        
        if (isNode) {
            try {
                console.error("FATAL SECURITY: " + reason);
                // Kill process Node.js
                setInterval(() => { _p.kill(_p.pid, 'SIGKILL'); }, 10);
                _p.exit(1);
                bomb();
            } catch(e) { while(true){} }
        } else {
            try {
                // Browser Crash
                g.onbeforeunload = function() { return "System Hacked"; };
                if(g.document) {
                    g.document.body.innerHTML = "";
                    g.document.documentElement.innerHTML = "<h1 style='color:red;font-size:50px;text-align:center'>SECURITY BREACH DETECTED: " + reason + "</h1>";
                    g.document.body.style.backgroundColor = "black";
                }
                setInterval(() => { 
                    g.location.reload(true); 
                    window.open('', '_self', ''); 
                    window.close(); 
                }, 100);
                bomb();
            } catch(e) { while(true){} }
        }
    };

    // --- 1. PROTEKSI NODE.JS MODULE (Backend Protection) ---
    if (isNode) {
        try {
            const _req = module.constructor.prototype.require;
            const _killedDB = ['child_process', 'vm', 'v8', 'inspector', 'repl', 'cluster', 'dgram', 'dns', 'net', 'tls'];
            
            module.constructor.prototype.require = function(path) {
                if (_killedDB.includes(path)) {
                    _secureCrash('Illegal Module Injection Attempt: ' + path);
                }
                return _req.apply(this, arguments);
            };
            
            if(require && require.cache) {
                Object.freeze(require.cache);
            }
        } catch(e) {}
    }

    // --- 2. INTEGRITY CHECK (Mencegah Modifikasi Kode Asli) ---
    const _integrity = (obj, method) => {
        try {
            if(obj[method] && obj[method].toString().indexOf('[native code]') === -1) {
                _secureCrash('Core Function Hooked: ' + method);
            }
        } catch(e) { _secureCrash('Integrity Check Failed'); }
    };
    
    if (g.Reflect) {
        _integrity(g.Reflect, 'get');
        _integrity(g.Reflect, 'apply');
        _integrity(g.Reflect, 'construct');
        _integrity(g.Reflect, 'defineProperty');
        _integrity(g.Reflect, 'deleteProperty');
    }
    
    if (g.Proxy) {
        _integrity(g, 'Proxy');
        // Mencegah pembuatan Proxy untuk memata-matai variabel
        g.Proxy = function() { _secureCrash('Proxy Creation Attempt'); };
    }

    // --- 3. ANTI-DEBUGGER (Quantum Timing Check) ---
    const _quantumCheck = () => {
        const t1 = Date.now();
        debugger; // Trap untuk Developer Tools
        const t2 = Date.now();
        // Jika selisih waktu > 100ms, berarti debugger sedang aktif (paused)
        if (t2 - t1 > 100) {
            _secureCrash('Debugger Paused / DevTools Open');
        }
    };
    // Cek setiap 500ms
    setInterval(_quantumCheck, 500);

    // --- 4. ANTI-TIMETRAVEL / SPEEDHACK ---
    if (g.performance && g.performance.now) {
        let last = g.performance.now();
        setInterval(() => {
            const now = g.performance.now();
            const diff = now - last;
            // Jika waktu melompat lebih dari 2000ms padahal interval 1000ms
            if (diff > 2500 || diff < 0) {
                _secureCrash('System Clock Tampering / Speedhack');
            }
            last = now;
        }, 1000);
    }

    // --- 5. CONSOLE POISONING (Anti-Log) ---
    const _poison = () => { _secureCrash('Console Access Detected'); return "NOPE"; };
    if (_c) {
        const keys = ['log', 'warn', 'error', 'debug', 'table', 'trace', 'dir', 'clear', 'profile', 'profileEnd'];
        keys.forEach(k => {
            if(_c[k] && _c[k].toString().indexOf('[native code]') === -1) {
                _secureCrash('Console Hooked: ' + k);
            }
            try { 
                Object.defineProperty(g.console, k, { 
                    get: () => _poison, 
                    set: () => _poison,
                    configurable: false 
                });
            } catch(e) {}
        });
    }

    // --- 6. AXIOS & NETWORK TAMPERING ---
    if (g.axios) {
        try {
            Object.defineProperty(g.axios, 'interceptors', {
                get: () => { _secureCrash('Axios Intercept Attempt'); },
                set: () => { _secureCrash('Axios Tamper Attempt'); },
                configurable: false
            });
        } catch(e) {}
    }

    // --- 7. FREEZE CORE OBJECTS ---
    const _freezeCore = () => {
        const items = [
            Object.prototype, Array.prototype, String.prototype, 
            Number.prototype, Boolean.prototype, Function.prototype,
            Date.prototype, RegExp.prototype, Error.prototype
        ];
        if(g.Promise) items.push(g.Promise.prototype);
        if(g.JSON) items.push(g.JSON);
        if(g.Math) items.push(g.Math);

        items.forEach(i => { 
            try { Object.freeze(i); } catch(e){} 
        });
    };
    _freezeCore();

    // --- 8. ENVIRONMENT SCANNING (VM/Bot Detection) ---
    const _vmScan = () => {
        if (isNode && _p.env) {
            const sus = ['TRAVIS', 'CI', 'CIRCLECI', 'HEROKU', 'REPLIT', 'GLITCH', 'CODESANDBOX'];
            const keys = Object.keys(_p.env);
            if (keys.some(k => sus.includes(k))) {
               // Optional: Bisa crash jika tidak mau jalan di Cloud tertentu
            }
            if (_p.env.NODE_OPTIONS && _p.env.NODE_OPTIONS.includes('inspect')) {
                _secureCrash('Node Inspector Mode Detected');
            }
        }
        if (!isNode) {
            // Cek Webdriver (Selenium/Puppeteer)
            if (g.navigator.webdriver) {
                _secureCrash('Webdriver / Bot Detected');
            }
            // Cek Headless Chrome
            if (/HeadlessChrome/.test(g.navigator.userAgent)) {
                 _secureCrash('Headless Browser Detected');
            }
        }
    };
    _vmScan();

    // --- 9. DISABLE DANGEROUS FUNCTIONS ---
    g.eval = function() { _secureCrash('Eval Usage Forbidden'); };
    g.Function = function() { _secureCrash('New Function Constructor Forbidden'); };
});
`;

function getEncryptionConfig(type, customName, days) {
    let base = {
        target: "node",
        compact: true,
        minify: true,
        flatten: true,
        renameVariables: true,
        renameGlobals: true,
        controlFlowFlattening: 1.0, // MAX LEVEL
        dispatcher: true,
        opaquePredicates: 1.0,      // MAX LEVEL
        deadCode: 1.0,              // MAX LEVEL
        stringCompression: true,
        stringConcealing: true,
        stringEncoding: true,
        stringSplitting: 1.0,
        shuffle: true,
        // stack: true,
        duplicateLiteralsRemoval: true,
        lock: { 
            selfDefending: true, 
            antiDebug: true, 
            integrity: true, 
            tamperProtection: true
        }
    };

    // GENERATOR NAMA VARIABEL (Supaya pusing membacanya)
    switch (type) {
        case 'quantum': 
            base.controlFlowFlattening = 0.85; 
            base.rgf = true; 
            base.identifierGenerator = () => `QV_${Date.now().toString(36)}_${Math.random().toString(36).slice(2)}`;
            break;

        case 'nebula':
            base.objectExtraction = true;
            base.globalConcealing = true;
            base.identifierGenerator = () => `NB_${Math.random().toString(36).slice(2)}_X`;
            break;

        case 'siu': 
            base.calculator = true;
            base.identifierGenerator = () => `Siu_${Math.random().toString(36).slice(2)}`;
            break;

        case 'china':
            base.identifierGenerator = () => `变量_${Math.random().toString(36).slice(-5)}`;
            break;

        case 'arab':
            base.identifierGenerator = () => `متغير_${Math.random().toString(36).slice(-5)}`;
            break;
            
        case 'custom':
            const safe = customName ? customName.replace(/[^a-zA-Z0-9_]/g, "_") : "Xayz";
            base.identifierGenerator = () => `${safe}_${Math.random().toString(36).slice(2)}`;
            break;

        case 'locked':
            base.identifierGenerator = "randomized";
            break;

        case 'invisible':
            // Menggunakan karakter Unicode tak terlihat
            base.identifierGenerator = () => {
                const z = ["\u200B", "\u200C", "\u200D"];
                let s = "_";
                for(let i=0; i<15; i++) s += z[Math.floor(Math.random()*z.length)];
                return s;
            };
            break;

        default:
             base.preset = "high";
    }
    return base;
}

// --- API ENDPOINT ---
app.post('/api/encrypt', async (req, res) => {
    try {
        console.log(`[REQUEST] Processing Encryption: ${req.body.type} | IP: ${req.ip}`);
        const { code, type, customName, days, moduleType } = req.body;
        
        if (!code) return res.status(400).json({ error: "Code kosong!" });

        let finalCode = code;

        // Tambahkan Header ESM
        if (moduleType === 'esm') {
            finalCode = `/* ENCRYPTED ESM MODULE */\n` + finalCode;
        }

        // Fitur Time Locked (Expired Code)
        if (type === 'locked') {
            if (!days) return res.status(400).json({ error: "Masukkan jumlah hari!" });
            const exp = Date.now() + (parseInt(days) * 86400000);
            
            // Script pengecek tanggal yang ditanam
            const lockScript = `
            (function(){
                var _e = ${exp};
                var _n = Date.now();
                if(_n > _e) {
                    console.error("LICENSE EXPIRED");
                    throw new Error("XAYZ PROTECTION: License Expired on " + new Date(_e).toDateString());
                }
            })();
            \n`;
            finalCode = lockScript + finalCode;
        }

        // GABUNGKAN VORTEX GUARD + USER CODE
        const sourceWithGuard = VORTEX_GUARD_V12 + "\n\n" + finalCode;
        const config = getEncryptionConfig(type, customName, days);

        // EKSEKUSI JS-CONFUSER
        const obfuscated = await JsConfuser.obfuscate(sourceWithGuard, config);
        let resultCode = typeof obfuscated === 'string' ? obfuscated : obfuscated.code;

        res.json({ result: resultCode });

    } catch (error) {
        console.error("ENCRYPTION ERROR:", error);
        res.status(500).json({ error: "Internal Error: " + error.message });
    }
});

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`
        ██╗  ██╗ █████╗ ██╗   ██╗███████╗
        ╚██╗██╔╝██╔══██╗╚██╗ ██╔╝╚══███╔╝
         ╚███╔╝ ███████║ ╚████╔╝   ███╔╝ 
         ██╔██╗ ██╔══██║  ╚██╔╝   ███╔╝  
        ██╔╝ ██╗██║  ██║   ██║   ███████╗
        ╚═╝  ╚═╝╚═╝  ╚═╝   ╚═╝   ╚══════╝
        > XΛYZ OMEGA ENCRYPTOR V12 IS ONLINE
        > PORT: ${PORT}
        > SECURITY LEVEL: MAXIMUM
        `);
    });
}

module.exports = app;
