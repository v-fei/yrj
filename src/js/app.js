(function () {
  var runtimeConfig = window.APP_CONFIG || {};
  function pick(path, fallback) {
    var value = runtimeConfig;
    var parts = path.split('.');
    for (var i = 0; i < parts.length; i++) {
      if (value == null || typeof value !== 'object' || !(parts[i] in value)) return fallback;
      value = value[parts[i]];
    }
    return value == null ? fallback : value;
  }
  function toNumber(value, fallback) {
    return typeof value === 'number' && !isNaN(value) ? value : fallback;
  }
  function formatCopy(template, params) {
    return String(template || '').replace(/\{(\w+)\}/g, function (_, key) {
      return params && key in params ? params[key] : '';
    });
  }
  function applyTemplateTokens(value, params) {
    if (typeof value === 'string') return formatCopy(value, params);
    if (Array.isArray(value)) {
      return value.map(function (item) { return applyTemplateTokens(item, params); });
    }
    if (value && typeof value === 'object') {
      var next = {};
      Object.keys(value).forEach(function (key) {
        next[key] = applyTemplateTokens(value[key], params);
      });
      return next;
    }
    return value;
  }
  function formatCurrentDateLabel() {
    var now = new Date();
    var yyyy = now.getFullYear();
    var mm = String(now.getMonth() + 1).padStart(2, '0');
    var dd = String(now.getDate()).padStart(2, '0');
    return '立约日期：' + yyyy + '年' + mm + '月' + dd + '日';
  }
  function resolveProposalDateLabel(label) {
    var text = String(label || '').trim();
    if (!text || /_{2,}/.test(text)) return formatCurrentDateLabel();
    return text;
  }

  var sceneOrder = pick('sceneOrder', ['opening', 'album', 'fireworks', 'proposal']);
  var peopleTokens = pick('content.people', {});
  peopleTokens = {
    maleName: String(peopleTokens.maleName || 'xx'),
    femaleName: String(peopleTokens.femaleName || 'XX')
  };
  var uiCopy = pick('content.ui', {});
  var albumImagePattern = pick('assets.albumImagePattern', 'src/assets/images/1/{n}.jpg');
  var albumData = pick('content.albumData', []).map(function (item) {
    item = applyTemplateTokens(item, peopleTokens);
    var n = String(item.id).padStart(2, '0');
    item.image = String(albumImagePattern || '').replace('{n}', n);
    return item;
  });

  var scriptData = applyTemplateTokens(pick('content.scriptData', {}), peopleTokens);
  scriptData.opening = Array.isArray(scriptData.opening) ? scriptData.opening : [];
  scriptData.fireworks = scriptData.fireworks || {};
  scriptData.fireworks.countdown = Array.isArray(scriptData.fireworks.countdown) ? scriptData.fireworks.countdown : ['3', '2', '1'];
  scriptData.fireworks.stagedLines = Array.isArray(scriptData.fireworks.stagedLines) ? scriptData.fireworks.stagedLines : [];
  scriptData.fireworks.composeWords = Array.isArray(scriptData.fireworks.composeWords) ? scriptData.fireworks.composeWords : [];
  scriptData.fireworks.climaxWord = scriptData.fireworks.climaxWord || scriptData.fireworks.composeWords[0] || '';
  scriptData.fireworks.holdMs = toNumber(scriptData.fireworks.holdMs, 15000);
  scriptData.proposal = scriptData.proposal || {};
  scriptData.proposal.vows = Array.isArray(scriptData.proposal.vows) ? scriptData.proposal.vows : [];
  scriptData.proposal.certificateLines = Array.isArray(scriptData.proposal.certificateLines) ? scriptData.proposal.certificateLines : ['', '', ''];
  scriptData.proposal.memoryKeywords = Array.isArray(scriptData.proposal.memoryKeywords) ? scriptData.proposal.memoryKeywords : [];
  scriptData.proposal.dateLabel = resolveProposalDateLabel(scriptData.proposal.dateLabel);

  var openingTiming = pick('timing.opening', { typeCharMs: 190, linePauseMs: 2000 });
  var autoRhythm = pick('timing.autoRhythm', {
    opening: { dwellMs: 42000 },
    album: { dwellMs: 75000, activeDwellMs: 90000 },
    fireworks: { dwellMs: 32000, postClimaxHoldMs: 6000 },
    proposal: { dwellMs: 60000 }
  });
  autoRhythm.proposal = autoRhythm.proposal || {};
  autoRhythm.proposal.lockScene = !!pick('flags.lockProposalScene', true);
  var proposalRhythm = pick('timing.proposalRhythm', {
    introMs: 2000,
    revealMs: 420,
    holdMs: 2600,
    transitionMs: 180,
    warmDelayMs: 360,
    signerDelayMs: 360,
    signerGapMs: 240
  });
  var fireworksTextMinDwellMs = toNumber(pick('timing.fireworksTextMinDwellMs', 1200), 1200);
  var fireworksStageProfiles = pick('thresholds.fireworksStageProfiles', {
    build: { chance: 0.82, intervalMs: 900, burstMin: 118, burstMax: 162, vxSpread: 2.1, vyMin: 5.4, vyMax: 8.2 },
    climax: { chance: 1, intervalMs: 160, burstMin: 188, burstMax: 258, vxSpread: 2.8, vyMin: 6.2, vyMax: 9.4 },
    tail: { chance: 0.62, intervalMs: 700, burstMin: 96, burstMax: 142, vxSpread: 1.8, vyMin: 5.2, vyMax: 7.3 },
    normal: { chance: 0.84, intervalMs: 860, burstMin: 124, burstMax: 168, vxSpread: 2.1, vyMin: 5.4, vyMax: 8.1 }
  });
  var fireworksCinematic = pick('thresholds.fireworksCinematic', {});
  var fireworksClarity = fireworksCinematic.clarity || {};
  var fireworksHeightBands = fireworksCinematic.heightBands || {};
  var fireworksColorStrategy = fireworksCinematic.colorStrategy || {};
  var fireworksPureAmplification = fireworksCinematic.pureAmplification || {};
  var fireworksEngine = fireworksCinematic.engine || {};
  var fireworksTextStyle = fireworksCinematic.textStyle || {};
  var fireworksTextProfiles = fireworksCinematic.textProfiles || {};
  var fireworksPeakGuardrails = fireworksCinematic.peakGuardrails || {};
  var fireworksPurePalette = Array.isArray(fireworksColorStrategy.purePalette) && fireworksColorStrategy.purePalette.length
    ? fireworksColorStrategy.purePalette.slice()
    : [352, 54, 284];
  var fireworksAccentPalette = Array.isArray(fireworksColorStrategy.accentPalette) && fireworksColorStrategy.accentPalette.length
    ? fireworksColorStrategy.accentPalette.slice()
    : [18, 28, 36, 44, 338, 346, 352];
  var fireworksPureHueJitter = toNumber(fireworksColorStrategy.pureHueJitter, 4);
  var fireworksAccentHueJitter = toNumber(fireworksColorStrategy.accentHueJitter, 17);
  var fireworksSizeScale = toNumber(fireworksClarity.sizeScale, 0.75);
  var fireworksGravityScale = toNumber(fireworksClarity.gravityScale, 0.8);
  var fireworksGlowOuterAlpha = toNumber(fireworksClarity.glowOuterAlpha, 0.044);
  var fireworksTrailAlphaScale = toNumber(fireworksClarity.trailAlphaScale, 0.5);
  var fireworksTrailWidthScale = toNumber(fireworksClarity.trailWidthScale, 0.8);
  var fireworksCoreRatio = Math.max(0, Math.min(1, toNumber(fireworksClarity.coreRatio, 0.34)));
  var fireworksRocketSizeScale = Math.max(0.4, Math.min(1.2, toNumber(fireworksClarity.rocketSizeScale, 0.72)));
  var fireworksRocketGlowAlpha = Math.max(0.005, Math.min(0.16, toNumber(fireworksClarity.rocketGlowAlpha, 0.02)));
  var fireworksRocketCoreAlpha = Math.max(0.2, Math.min(1, toNumber(fireworksClarity.rocketCoreAlpha, 0.78)));
  var fireworksTrailFadeAlpha = Math.max(0.01, Math.min(0.22, toNumber(fireworksEngine.trailFadeAlpha, 0.06)));
  var fireworksTrailSegments = Math.max(2, Math.min(12, Math.floor(toNumber(fireworksEngine.trailSegments, 6))));
  var fireworksParticleFadeMin = Math.max(0.001, Math.min(0.05, toNumber(fireworksEngine.particleFadeMin, 0.004)));
  var fireworksParticleFadeMax = Math.max(fireworksParticleFadeMin, Math.min(0.06, toNumber(fireworksEngine.particleFadeMax, 0.011)));
  var fireworksParticleShrinkMin = Math.max(0.88, Math.min(0.995, toNumber(fireworksEngine.particleShrinkMin, 0.932)));
  var fireworksParticleShrinkMax = Math.max(fireworksParticleShrinkMin, Math.min(0.998, toNumber(fireworksEngine.particleShrinkMax, 0.974)));
  var fireworksClimaxTimerBurstMin = Math.max(60, Math.floor(toNumber(fireworksPeakGuardrails.climaxTimerBurstMin, 150)));
  var fireworksClimaxTimerBurstMax = Math.max(fireworksClimaxTimerBurstMin + 8, Math.floor(toNumber(fireworksPeakGuardrails.climaxTimerBurstMax, 208)));
  var fireworksMassBurstWaves = Math.max(2, Math.min(10, Math.floor(toNumber(fireworksPeakGuardrails.massBurstWaves, 6))));
  var fireworksMassBurstWaveIntervalMs = Math.max(80, Math.floor(toNumber(fireworksPeakGuardrails.massBurstWaveIntervalMs, 150)));
  var fireworksMassBurstCountMin = Math.max(80, Math.floor(toNumber(fireworksPeakGuardrails.massBurstCountMin, 170)));
  var fireworksMassBurstCountMax = Math.max(fireworksMassBurstCountMin + 12, Math.floor(toNumber(fireworksPeakGuardrails.massBurstCountMax, 230)));
  var fireworksReducedMassBurstWaves = Math.max(2, Math.min(8, Math.floor(toNumber(fireworksPeakGuardrails.reducedMassBurstWaves, 4))));
  var fireworksReducedMassBurstCountMin = Math.max(64, Math.floor(toNumber(fireworksPeakGuardrails.reducedMassBurstCountMin, 110)));
  var fireworksReducedMassBurstCountMax = Math.max(fireworksReducedMassBurstCountMin + 10, Math.floor(toNumber(fireworksPeakGuardrails.reducedMassBurstCountMax, 150)));
  var fireworksTextFontFamily = String(fireworksTextStyle.fontFamily || '"STKaiti", "KaiTi", "Kaiti SC", "Songti SC", "Noto Serif SC", serif');
  var fireworksTextFontWeight = String(fireworksTextStyle.fontWeight || "600");
  var fireworksTextStrokeColor = fireworksTextStyle.strokeColor || "rgba(40, 28, 20, 0.64)";
  var fireworksTextLineWidthScale = Math.max(0.02, Math.min(0.14, toNumber(fireworksTextStyle.lineWidthScale, 0.052)));
  var fireworksTextLineGapScale = Math.max(1.02, Math.min(1.4, toNumber(fireworksTextStyle.lineGapScale, 1.14)));
  var pureExplodeCountScale = toNumber(fireworksPureAmplification.explodeCountScale, 1.2);
  var pureSpeedScale = toNumber(fireworksPureAmplification.speedScale, 1.15);
  var pureIntensityScale = toNumber(fireworksPureAmplification.intensityScale, 1.12);
  var audioConfig = pick('assets.audio', {});
  var audioThresholds = pick('thresholds.audio', {});
  var effectThresholds = pick('thresholds.effect', {});
  var maxTextParticles = Math.max(400, Math.floor(toNumber(effectThresholds.maxTextParticles, 1800)));
  var proposalMemoryTraceLifeMs = toNumber(pick('timing.proposalMemoryTraceLifeMs', 1550), 1550);
  var proposalMemoryAmbientMs = toNumber(pick('timing.proposalMemoryAmbientMs', 1800), 1800);
  var proposalMemoryAmbientReducedMs = toNumber(pick('timing.proposalMemoryAmbientReducedMs', 2400), 2400);
  var focusAutoCloseInactiveMs = toNumber(pick('timing.focusAutoCloseInactiveMs', 60000), 60000);
  var albumActiveActionMs = toNumber(pick('timing.albumActiveActionMs', 30000), 30000);
  var autoModeTickMs = toNumber(pick('timing.autoModeTickMs', 1000), 1000);
  var preloadImageTimeoutMs = toNumber(pick('timing.preloadImageTimeoutMs', 8000), 8000);
  var preloadAudioTimeoutMs = toNumber(pick('timing.preloadAudioTimeoutMs', 10000), 10000);
  var fireworksClimaxDurationMs = toNumber(pick('timing.fireworksClimaxDurationMs', 2600), 2600);
  var fireworksClimaxIntervalMs = toNumber(pick('timing.fireworksClimaxIntervalMs', 170), 170);
  var fireworksAmbientTickMs = toNumber(pick('timing.fireworksAmbientTickMs', 160), 160);

  var proposalStates = {
    INTRO: "proposal_intro",
    VOW1: "vow_1",
    VOW2: "vow_2",
    VOW3: "vow_3",
    GATE_WAITING: "gate_waiting",
    CONFIRMED: "vow_confirmed",
  };
  var reducedMotionMedia = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)");
  var isReducedMotion = !!(reducedMotionMedia && reducedMotionMedia.matches);
  var sceneEnteredAt = Date.now();
  var fireworksReadyForProposalAt = 0;
  var fireworksTextWindowUntil = 0;
  var proposalToken = 0;
  var proposalState = proposalStates.INTRO;
  var proposalMemoryTimer = null;

  function makeFallback(label) {
    return "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" width="960" height="1200"><defs><linearGradient id="g" x1="0" x2="1" y1="0" y2="1"><stop stop-color="#ffaad2"/><stop offset="1" stop-color="#ffd98f"/></linearGradient></defs><rect width="100%" height="100%" fill="url(#g)"/><text x="50%" y="48%" font-size="56" text-anchor="middle" fill="#fff">' + label + "</text></svg>"
    );
  }
  function getHeightBand(stage) {
    var band = fireworksHeightBands[stage] || fireworksHeightBands.normal || { minRatio: 0.1, maxRatio: 0.16 };
    var minRatio = Math.max(0.02, Math.min(0.3, toNumber(band.minRatio, 0.1)));
    var maxRatio = Math.max(minRatio + 0.02, Math.min(0.36, toNumber(band.maxRatio, 0.16)));
    return { minRatio: minRatio, maxRatio: maxRatio };
  }
  function getPureWeight(stage) {
    var pureWeightMap = fireworksColorStrategy.pureWeight || {};
    var fallback = toNumber(pureWeightMap.normal, 0.7);
    var weight = toNumber(pureWeightMap[stage], fallback);
    return Math.max(0, Math.min(1, weight));
  }
  function chooseFireworkTone(stage) {
    var isPure = Math.random() < getPureWeight(stage || "normal");
    var palette = isPure ? fireworksPurePalette : fireworksAccentPalette;
    var baseHue = palette[Math.floor(Math.random() * palette.length)];
    var jitter = isPure ? fireworksPureHueJitter : fireworksAccentHueJitter;
    var hue = (baseHue + (Math.random() * 2 - 1) * jitter + 360) % 360;
    return { hue: hue, isPure: isPure };
  }
  function randomBurstTargetY(stage) {
    var band = getHeightBand(stage || "normal");
    var minY = Math.max(8, Math.floor(window.innerHeight * band.minRatio));
    var maxY = Math.max(minY + 20, Math.floor(window.innerHeight * band.maxRatio));
    return minY + Math.random() * Math.max(12, maxY - minY);
  }

  function SceneStateManager() {
    this.mode = "free";
    this.currentSceneIndex = 0;
    this.listeners = [];
    this.viewedAlbum = new Set();
    this.lastUserAction = Date.now();
  }
  SceneStateManager.prototype.getCurrentScene = function () {
    return sceneOrder[this.currentSceneIndex];
  };
  SceneStateManager.prototype.setMode = function (mode) {
    if (mode === "free" || mode === "auto") {
      this.mode = mode;
      this.notify();
    }
  };
  SceneStateManager.prototype.markUserAction = function () {
    this.lastUserAction = Date.now();
  };
  SceneStateManager.prototype.goStep = function (delta) {
    var next = this.currentSceneIndex + delta;
    if (next < 0) next = 0;
    if (next > sceneOrder.length - 1) next = sceneOrder.length - 1;
    this.currentSceneIndex = next;
    this.markUserAction();
    this.notify();
  };
  SceneStateManager.prototype.goToScene = function (sceneId, markAction) {
    var idx = sceneOrder.indexOf(sceneId);
    if (idx >= 0) {
      this.currentSceneIndex = idx;
      if (markAction !== false) this.markUserAction();
      this.notify();
    }
  };
  SceneStateManager.prototype.markAlbumViewed = function (id) {
    this.viewedAlbum.add(id);
    this.notify();
  };
  SceneStateManager.prototype.subscribe = function (cb) {
    this.listeners.push(cb);
  };
  SceneStateManager.prototype.notify = function () {
    var sceneId = this.getCurrentScene();
    this.listeners.forEach(function (cb) { cb(sceneId); });
  };

  function AudioController() {
    this.enabled = false;
    this.muted = true;
    this.ctx = null;
    this.fireworkSources = Array.isArray(audioConfig.firework) ? audioConfig.firework.slice() : [];
    this.launchSources = Array.isArray(audioConfig.launch) ? audioConfig.launch.slice() : this.fireworkSources.slice();
    this.fireworkIndex = 0;
    this.launchIndex = 0;
    this.activeBurstPlayers = 0;
    this.maxBurstPlayers = toNumber(audioThresholds.maxBurstPlayers, 4);
    this.burstMinGapMs = toNumber(audioThresholds.burstMinGapMs, 70);
    this.lastBurstAt = 0;
    this.activeLaunchPlayers = 0;
    this.maxLaunchPlayers = toNumber(audioThresholds.maxLaunchPlayers, 2);
    this.launchMinGapMs = toNumber(audioThresholds.launchMinGapMs, 120);
    this.lastLaunchAt = 0;
    this.bgm = new Audio(audioConfig.bgm || "");
    this.bgm.loop = true;
    this.bgm.preload = "auto";
    this.bgm.volume = toNumber(audioThresholds.bgmVolume, 0.34);
  }
  AudioController.prototype.enable = async function () {
    if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    await this.ctx.resume();
    this.enabled = true;
    this.muted = false;
    this.bgm.muted = false;
    this.bgm.play().catch(function () { });
  };
  AudioController.prototype.toggleMute = function () {
    if (!this.enabled) return false;
    this.muted = !this.muted;
    this.bgm.muted = this.muted;
    if (this.muted) this.bgm.pause();
    else this.bgm.play().catch(function () { });
    return !this.muted;
  };
  AudioController.prototype.play = function (f, d, type, gain) {
    if (!this.enabled || this.muted || !this.ctx) return;
    var o = this.ctx.createOscillator();
    var g = this.ctx.createGain();
    o.type = type || "sine";
    o.frequency.value = f;
    g.gain.value = gain || 0.02;
    o.connect(g);
    g.connect(this.ctx.destination);
    o.start();
    o.stop(this.ctx.currentTime + (d || 0.12));
  };
  AudioController.prototype.playFireworkSample = function (opts) {
    opts = opts || {};
    if (!this.enabled || this.muted || this.fireworkSources.length === 0) return;
    var now = Date.now();
    var maxConcurrent = opts.critical ? this.maxBurstPlayers + 1 : this.maxBurstPlayers;
    if (!opts.critical && now - this.lastBurstAt < this.burstMinGapMs) return;
    if (!opts.critical && this.activeBurstPlayers >= maxConcurrent) return;
    this.lastBurstAt = now;
    var src = this.fireworkSources[this.fireworkIndex % this.fireworkSources.length];
    this.fireworkIndex += 1;
    var a = new Audio(src);
    this.activeBurstPlayers += 1;
    a.volume = opts.critical ? 0.38 : 0.3;
    a.playbackRate = opts.critical ? (0.92 + Math.random() * 0.08) : (0.96 + Math.random() * 0.12);
    var self = this;
    var release = function () {
      self.activeBurstPlayers = Math.max(0, self.activeBurstPlayers - 1);
    };
    a.addEventListener("ended", release, { once: true });
    a.addEventListener("error", release, { once: true });
    a.play().catch(function () { });
  };
  AudioController.prototype.playLaunchSample = function (opts) {
    opts = opts || {};
    if (!this.enabled || this.muted || this.launchSources.length === 0) return;
    var now = Date.now();
    if (!opts.critical && now - this.lastLaunchAt < this.launchMinGapMs) return;
    if (!opts.critical && this.activeLaunchPlayers >= this.maxLaunchPlayers) return;
    this.lastLaunchAt = now;
    var src = this.launchSources[this.launchIndex % this.launchSources.length];
    this.launchIndex += 1;
    var a = new Audio(src);
    this.activeLaunchPlayers += 1;
    a.currentTime = 0;
    a.volume = opts.critical ? 0.28 : 0.22;
    a.playbackRate = opts.critical ? (1.24 + Math.random() * 0.14) : (1.32 + Math.random() * 0.18);
    var self = this;
    var release = function () {
      self.activeLaunchPlayers = Math.max(0, self.activeLaunchPlayers - 1);
    };
    a.addEventListener("ended", release, { once: true });
    a.addEventListener("error", release, { once: true });
    a.play().catch(function () { });
  };
  AudioController.prototype.cue = function (name, opts) {
    opts = opts || {};
    if (name === "count-3") this.play(180, 0.08, "triangle", 0.03);
    if (name === "count-2") this.play(220, 0.08, "triangle", 0.03);
    if (name === "count-1") this.play(280, 0.08, "triangle", 0.03);
    if (name === "firework-launch") {
      this.play(150, 0.085, "sawtooth", 0.03);
      this.playLaunchSample(opts);
    }
    if (name === "firework-burst") {
      this.play(90, opts.critical ? 0.24 : 0.2, "square", opts.critical ? 0.03 : 0.02);
      this.playFireworkSample(opts);
    }
    if (name === "open") this.play(500, 0.08, "sine", 0.02);
    if (name === "close") this.play(360, 0.08, "sine", 0.02);
    if (name === "success") {
      this.play(523, 0.14, "triangle", 0.03);
      setTimeout(this.play.bind(this, 659, 0.15, "triangle", 0.03), 100);
    }
  };

  function EffectEngine(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.rockets = [];
    this.particles = [];
    this.textParticles = [];
    this.roses = [];
    this.maxParticles = toNumber(effectThresholds.maxParticles, 4200);
    this.maxRockets = toNumber(effectThresholds.maxRockets, 20);
    this.fireworkPalette = fireworksAccentPalette.slice();
    this.pointer = { x: window.innerWidth * 0.5, y: window.innerHeight * 0.35 };
    this.onBurst = null;
    this.running = false;
    this.burstEnergy = 1;
    this.resize();
    window.addEventListener("resize", this.resize.bind(this));
  }
  EffectEngine.prototype.resize = function () {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = Math.floor(window.innerWidth * dpr);
    this.canvas.height = Math.floor(window.innerHeight * dpr);
    this.canvas.style.width = "100vw";
    this.canvas.style.height = "100vh";
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  EffectEngine.prototype.setPointer = function (x, y) {
    this.pointer.x = x;
    this.pointer.y = y;
  };
  EffectEngine.prototype.spawnBurst = function (x, y, count, tone, intensity) {
    intensity = typeof intensity === "number" ? intensity : this.burstEnergy;
    var n = count || 84;
    var toneInfo = tone && typeof tone === "object"
      ? tone
      : { hue: typeof tone === "number" ? tone : this.fireworkPalette[Math.floor(Math.random() * this.fireworkPalette.length)], isPure: false };
    var baseHue = toNumber(toneInfo.hue, this.fireworkPalette[Math.floor(Math.random() * this.fireworkPalette.length)]);
    var isPure = !!toneInfo.isPure;
    var speedScale = isPure ? pureSpeedScale : 1;
    var hueJitter = isPure ? fireworksPureHueJitter : fireworksAccentHueJitter;
    var sizeScale = Math.max(0.45, fireworksSizeScale);
    var gravityScale = Math.max(0.55, fireworksGravityScale);
    var coreRatio = fireworksCoreRatio;
    for (var i = 0; i < n; i++) {
      var angle = Math.random() * Math.PI * 2;
      var speed = Math.cos(Math.random() * Math.PI / 2) * (8.4 + Math.random() * 11.8) * intensity * speedScale;
      this.particles.push({
        x: x,
        y: y,
        px: x,
        py: y,
        trail: [{ x: x, y: y }],
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: (7.2 + Math.random() * 11.6) * Math.max(0.8, intensity) * sizeScale,
        resistance: 0.92,
        gravity: (0.1 + Math.random() * 0.12) * Math.max(0.72, 1.12 - intensity * 0.1) * gravityScale,
        shrink: fireworksParticleShrinkMin + Math.random() * Math.max(0.001, fireworksParticleShrinkMax - fireworksParticleShrinkMin),
        alpha: 1,
        fade: fireworksParticleFadeMin + Math.random() * Math.max(0.001, fireworksParticleFadeMax - fireworksParticleFadeMin),
        flick: Math.random() > 0.2,
        core: Math.random() < coreRatio,
        isPure: isPure,
        hue: (baseHue + (Math.random() * 2 - 1) * hueJitter + 360) % 360,
      });
    }
  };
  EffectEngine.prototype.launchFirework = function (x, y, count, opts) {
    opts = opts || {};
    var stage = opts.stage || "normal";
    var band = getHeightBand(stage);
    var minY = Math.max(8, Math.floor(window.innerHeight * band.minRatio));
    var maxY = Math.max(minY + 24, Math.floor(window.innerHeight * band.maxRatio));
    x = x || (26 + Math.random() * (window.innerWidth - 52));
    y = typeof y === "number" ? y : randomBurstTargetY(stage);
    y = Math.max(minY, Math.min(y, maxY));
    if (this.rockets.length >= this.maxRockets) return;
    var tone = chooseFireworkTone(stage);
    var vxSpread = typeof opts.vxSpread === "number" ? opts.vxSpread : 1.9;
    var vyMin = typeof opts.vyMin === "number" ? opts.vyMin : 5.4;
    var vyMax = typeof opts.vyMax === "number" ? opts.vyMax : 8.4;
    var intensity = typeof opts.intensity === "number" ? opts.intensity : 1;
    if (tone.isPure) intensity *= pureIntensityScale;
    var explodeCount = count || (220 + Math.floor(Math.random() * 72));
    if (tone.isPure) explodeCount = Math.floor(explodeCount * pureExplodeCountScale);
    this.rockets.push({
      x: x,
      y: window.innerHeight + 18,
      vx: Math.random() * (vxSpread * 2) - vxSpread,
      vy: -(vyMin + Math.random() * Math.max(0.8, vyMax - vyMin)),
      targetY: y,
      size: (7 + Math.random() * 2) * fireworksRocketSizeScale,
      life: 130,
      burstTone: tone,
      hue: tone.hue,
      explodeCount: explodeCount,
      intensity: intensity,
    });
  };
  EffectEngine.prototype.massBurst = function () {
    var self = this;
    var waves = isReducedMotion ? fireworksReducedMassBurstWaves : fireworksMassBurstWaves;
    var burstMin = isReducedMotion ? fireworksReducedMassBurstCountMin : fireworksMassBurstCountMin;
    var burstMax = isReducedMotion ? fireworksReducedMassBurstCountMax : fireworksMassBurstCountMax;
    for (var i = 0; i < waves; i++) {
      (function (step) {
        setTimeout(function () {
          var burstCount = burstMin + Math.floor(Math.random() * Math.max(1, burstMax - burstMin + 1));
          self.launchFirework(
            26 + Math.random() * (window.innerWidth - 52),
            randomBurstTargetY("climax"),
            burstCount,
            { stage: "climax", intensity: isReducedMotion ? 0.84 : 1.08, vxSpread: 2.4, vyMin: 6, vyMax: 8.8 }
          );
        }, step * fireworksMassBurstWaveIntervalMs);
      })(i);
    }
  };
  function buildParticleTextLines(text, maxChars) {
    var normalized = (text || "").replace(/\r/g, "").trim();
    if (!normalized) return [];
    var lines = [];
    normalized.split("\n").forEach(function (rawLine) {
      var chars = Array.from(rawLine.trim());
      if (chars.length === 0) return;
      for (var i = 0; i < chars.length; i += maxChars) {
        lines.push(chars.slice(i, i + maxChars).join(""));
      }
    });
    return lines;
  }
  function splitParticleTextSegments(text, maxChars, maxLines) {
    var lines = buildParticleTextLines(text, maxChars);
    if (lines.length === 0) return [];
    var cappedMaxLines = Math.max(1, maxLines || 1);
    if (lines.length <= cappedMaxLines) return [lines.join("\n")];
    var segments = [];
    for (var i = 0; i < lines.length; i += cappedMaxLines) {
      segments.push(lines.slice(i, i + cappedMaxLines).join("\n"));
    }
    return segments;
  }
  function getParticleTextDuration(text, minMs, perCharMs, maxMs) {
    var normalized = (text || "").replace(/\s+/g, "");
    var length = Array.from(normalized).length;
    var duration = minMs + length * perCharMs;
    return Math.max(minMs, Math.min(maxMs, duration));
  }
  EffectEngine.prototype.composeText = function (text, holdMs, opts) {
    opts = opts || {};
    var message = (text || "").trim();
    if (!message) {
      this.textParticles = [];
      return;
    }
    var viewportW = window.innerWidth;
    var viewportH = window.innerHeight;
    var maxChars = opts.maxChars || (viewportW < 820 ? 7 : 11);
    var maxLines = opts.maxLines || (viewportW < 820 ? 3 : 2);
    var lines = buildParticleTextLines(message, maxChars).slice(0, maxLines);
    if (lines.length === 0) {
      this.textParticles = [];
      return;
    }
    var displayWidth = Math.min(viewportW * 0.92, opts.maxWidth || (viewportW < 820 ? 640 : 980));
    var displayHeight = Math.min(viewportH * 0.42, opts.maxHeight || (viewportW < 820 ? 320 : 380));
    var normalizedTextLength = Array.from(message.replace(/\s+/g, "")).length;
    var renderScale = opts.renderScale || Math.min(1.9, Math.max(1.35, (window.devicePixelRatio || 1) * (normalizedTextLength >= 10 ? 1.08 : 1.22)));
    var off = document.createElement("canvas");
    off.width = Math.max(1, Math.floor(displayWidth * renderScale));
    off.height = Math.max(1, Math.floor(displayHeight * renderScale));
    var c = off.getContext("2d");
    c.setTransform(renderScale, 0, 0, renderScale, 0, 0);
    c.clearRect(0, 0, displayWidth, displayHeight);
    c.fillStyle = opts.fillColor || "#fff";
    c.strokeStyle = opts.strokeColor || fireworksTextStrokeColor;
    var longestLineLength = lines.reduce(function (max, line) {
      return Math.max(max, Array.from(line).length);
    }, 1);
    var fontSize = opts.fontSize || Math.min(
      viewportW < 820 ? 112 : 138,
      Math.max(viewportW < 820 ? 52 : 60, Math.floor(displayWidth / Math.max(2.6, longestLineLength * 0.72)))
    );
    var lineGap = Math.floor(fontSize * fireworksTextLineGapScale);
    for (var pass = 0; pass < 16; pass += 1) {
      c.font = (opts.fontWeight || fireworksTextFontWeight) + " " + Math.floor(fontSize) + "px " + (opts.fontFamily || fireworksTextFontFamily);
      lineGap = Math.floor(fontSize * fireworksTextLineGapScale);
      var totalHeightCandidate = (lines.length - 1) * lineGap;
      var fitsHeight = totalHeightCandidate <= displayHeight * 0.72;
      var fitsWidth = lines.every(function (line) {
        return c.measureText(line).width <= displayWidth * 0.9;
      });
      if (fitsHeight && fitsWidth) break;
      fontSize *= 0.92;
    }
    c.font = (opts.fontWeight || fireworksTextFontWeight) + " " + Math.floor(fontSize) + "px " + (opts.fontFamily || fireworksTextFontFamily);
    c.lineWidth = Math.max(1.2, fontSize * fireworksTextLineWidthScale);
    c.textAlign = "center";
    c.textBaseline = "middle";
    var totalHeight = (lines.length - 1) * lineGap;
    for (var li = 0; li < lines.length; li++) {
      var y = (displayHeight * 0.5 - totalHeight / 2) + li * lineGap;
      c.strokeText(lines[li], displayWidth / 2, y);
      c.fillText(lines[li], displayWidth / 2, y);
    }
    var data = c.getImageData(0, 0, off.width, off.height).data;
    this.textParticles = [];
    var charCount = normalizedTextLength;
    var baseStep = Math.max(1, opts.sampleStep || (viewportW < 820 ? 2 : 1));
    var step = Math.max(1, Math.min(4, charCount >= 10 ? (baseStep + 1) : baseStep));
    var scatterStartRatio = typeof opts.scatterStartRatio === "number" ? opts.scatterStartRatio : 0.82;
    var fadeStartRatio = typeof opts.fadeStartRatio === "number" ? opts.fadeStartRatio : 0.76;
    var jitterMin = typeof opts.jitterMin === "number" ? opts.jitterMin : 0.03;
    var jitterMax = typeof opts.jitterMax === "number" ? opts.jitterMax : 0.14;
    var approachLerp = Math.max(0.08, Math.min(0.28, typeof opts.approachLerp === "number" ? opts.approachLerp : 0.14));
    for (var yy = 0; yy < off.height; yy += step) {
      for (var xx = 0; xx < off.width; xx += step) {
        var idx = (yy * off.width + xx) * 4 + 3;
        if (data[idx] > 188) {
          this.textParticles.push({
            x: Math.random() * viewportW,
            y: Math.random() * (viewportH * 0.65),
            tx: (viewportW - displayWidth) * 0.5 + xx / renderScale,
            ty: viewportH * 0.2 + (yy / renderScale) * 0.9,
            life: Math.floor(holdMs / 16),
            ttl: Math.floor(holdMs / 16),
            color: opts.color || "#ffe679",
            size: opts.pixelSize || (viewportW < 820 ? 2.6 : 2.2),
            alpha: 1,
            jitter: jitterMin + Math.random() * Math.max(0.01, jitterMax - jitterMin),
            scatterVx: (Math.random() * 2 - 1) * 0.45,
            scatterVy: (Math.random() * 2 - 1) * 0.45,
            scatterStartRatio: scatterStartRatio,
            fadeStartRatio: fadeStartRatio,
            approachLerp: approachLerp,
          });
        }
      }
    }
    if (this.textParticles.length > maxTextParticles) {
      var stride = Math.ceil(this.textParticles.length / maxTextParticles);
      var compact = [];
      for (var si = 0; si < this.textParticles.length; si += stride) compact.push(this.textParticles[si]);
      this.textParticles = compact;
    }
  };
  EffectEngine.prototype.spawnRoses = function (count) {
    var n = count || 80;
    for (var i = 0; i < n; i++) {
      this.roses.push({
        x: Math.random() * window.innerWidth,
        y: -120 + Math.random() * 110,
        vy: 0.9 + Math.random() * 1.4,
        sway: -0.03 + Math.random() * 0.06,
        size: 10 + Math.random() * 14,
      });
    }
  };
  EffectEngine.prototype.update = function () {
    var self = this;
    var existingRockets = [];
    this.rockets.forEach(function (r) {
      r.vx *= 0.992;
      r.vy += 0.045;
      r.x += r.vx;
      r.y += r.vy;
      r.life -= 1;
      var dx = self.pointer.x - r.x;
      var dy = self.pointer.y - r.y;
      var distance = Math.sqrt(dx * dx + dy * dy);
      var randomChance = Math.abs(r.y - r.targetY) < 28 && Math.random() < 0.004;
      var shouldExplode = r.y <= r.targetY || r.vy >= 0 || distance < 56 || randomChance || r.life <= 0;
      if (shouldExplode) {
        self.spawnBurst(r.x, r.y, r.explodeCount, r.burstTone || r.hue, r.intensity);
        if (Math.random() > 0.72 && self.textParticles.length === 0) {
          setTimeout(function () {
            var followTone = r.burstTone && r.burstTone.isPure
              ? { hue: r.burstTone.hue, isPure: true }
              : { hue: (r.hue + 26) % 360, isPure: false };
            self.spawnBurst(
              r.x + (Math.random() * 60 - 30),
              r.y + (Math.random() * 40 - 20),
              Math.max(120, Math.floor(r.explodeCount * 0.72)),
              followTone,
              Math.max(0.78, r.intensity * 0.92)
            );
          }, 110 + Math.floor(Math.random() * 90));
        }
        if (typeof self.onBurst === "function") self.onBurst(r.x, r.y, r.explodeCount);
      } else {
        existingRockets.push(r);
      }
    });
    this.rockets = existingRockets;

    this.particles.forEach(function (p) {
      p.px = p.x;
      p.py = p.y;
      p.vx *= p.resistance;
      p.vy = p.vy * p.resistance + p.gravity;
      p.x += p.vx;
      p.y += p.vy;
      if (!Array.isArray(p.trail)) p.trail = [];
      var trailPoint = { x: p.x, y: p.y };
      if (p.trail.length > 0) {
        var lastTrail = p.trail[p.trail.length - 1];
        var trailDx = trailPoint.x - lastTrail.x;
        var trailDy = trailPoint.y - lastTrail.y;
        if (trailDx * trailDx + trailDy * trailDy > 9) p.trail.push(trailPoint);
      } else {
        p.trail.push(trailPoint);
      }
      if (p.trail.length > fireworksTrailSegments) p.trail.splice(0, p.trail.length - fireworksTrailSegments);
      p.size *= p.shrink;
      p.alpha -= p.fade;
    });
    this.particles = this.particles.filter(function (p) {
      return p.alpha > 0.08 && p.size > 0.6;
    });
    while (this.particles.length > this.maxParticles) this.particles.shift();
    this.textParticles.forEach(function (p) {
      var progress = p.ttl > 0 ? 1 - (p.life / p.ttl) : 1;
      if (progress < p.scatterStartRatio) {
        var settleSpeed = typeof p.approachLerp === "number" ? p.approachLerp : 0.14;
        p.x += (p.tx - p.x) * settleSpeed + (Math.random() - 0.5) * p.jitter;
        p.y += (p.ty - p.y) * settleSpeed + (Math.random() - 0.5) * p.jitter;
      } else {
        p.x += p.scatterVx + (Math.random() - 0.5) * 0.4;
        p.y += p.scatterVy + (Math.random() - 0.5) * 0.4;
      }
      p.alpha = progress < p.fadeStartRatio ? 1 : Math.max(0, 1 - (progress - p.fadeStartRatio) / Math.max(0.08, 1 - p.fadeStartRatio));
      p.life -= 1;
    });
    this.textParticles = this.textParticles.filter(function (p) { return p.life > 0; });
    this.roses.forEach(function (r) {
      r.y += r.vy;
      r.x += Math.sin(r.y * 0.04) * 1.4 + r.sway * 22;
    });
    this.roses = this.roses.filter(function (r) { return r.y < window.innerHeight + 60; });
  };
  EffectEngine.prototype.draw = function () {
    var ctx = this.ctx;
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = "rgba(0, 0, 0, " + fireworksTrailFadeAlpha.toFixed(3) + ")";
    ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
    ctx.globalCompositeOperation = "source-over";
    this.rockets.forEach(function (r) {
      var gradient = ctx.createRadialGradient(r.x, r.y, 0.1, r.x, r.y, r.size);
      gradient.addColorStop(0.08, "rgba(255,255,255," + fireworksRocketCoreAlpha.toFixed(3) + ")");
      gradient.addColorStop(0.52, "rgba(255,210,168," + (fireworksRocketGlowAlpha * 0.55).toFixed(3) + ")");
      gradient.addColorStop(1, "rgba(255,180,120," + fireworksRocketGlowAlpha.toFixed(3) + ")");
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(r.x, r.y, r.size, 0, Math.PI * 2);
      ctx.fill();
    });
    this.particles.forEach(function (p) {
      var radius = p.flick ? (Math.random() * p.size * 0.6 + p.size * 0.4) : p.size;
      var isCore = !!p.core;
      var saturation = p.isPure ? 98 : 92;
      var lightness = p.isPure ? 58 : 60;
      var outerLightness = p.isPure ? 34 : 36;
      var outerAlpha = Math.max(0.01, fireworksGlowOuterAlpha) * (isCore ? 0.9 : 0.48);
      var coreWhiteAlpha = p.alpha * (isCore ? 0.88 : 0.52);
      var midAlpha = p.alpha * (isCore ? 0.92 : 0.84);
      ctx.globalCompositeOperation = isCore ? "lighter" : "source-over";
      if (Array.isArray(p.trail) && p.trail.length > 1) {
        var trailStart = { x: p.x, y: p.y };
        for (var ti = p.trail.length - 1; ti >= 0; ti--) {
          var seg = p.trail[ti];
          var segAlpha = (ti / p.trail.length) * p.alpha * (isCore ? 0.44 : 0.34) * fireworksTrailAlphaScale;
          if (segAlpha <= 0.01) continue;
          ctx.strokeStyle = "hsla(" + p.hue + ", " + saturation + "%, " + (isCore ? 64 : 60) + "%, " + segAlpha.toFixed(3) + ")";
          ctx.lineWidth = Math.max(0.45, (1 + radius * 0.95 / Math.max(1, p.trail.length - ti)) * fireworksTrailWidthScale);
          ctx.beginPath();
          ctx.moveTo(trailStart.x, trailStart.y);
          ctx.lineTo(seg.x, seg.y);
          ctx.stroke();
          trailStart = seg;
        }
      }
      var gradient = ctx.createRadialGradient(p.x, p.y, 0.1, p.x, p.y, radius);
      gradient.addColorStop(0.05, "rgba(255,255,255," + coreWhiteAlpha.toFixed(3) + ")");
      gradient.addColorStop(0.72, "hsla(" + p.hue + ", " + saturation + "%, " + lightness + "%, " + midAlpha.toFixed(3) + ")");
      gradient.addColorStop(1, "hsla(" + p.hue + ", " + saturation + "%, " + outerLightness + "%, " + outerAlpha.toFixed(3) + ")");
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalCompositeOperation = "source-over";
    this.textParticles.forEach(function (p) {
      var alpha = typeof p.alpha === "number" ? p.alpha : 0.92;
      ctx.globalAlpha = 0.95 * alpha;
      ctx.fillStyle = p.color;
      var size = p.size || 2.8;
      ctx.beginPath();
      ctx.arc(p.x, p.y, size * 0.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 0.11 * alpha;
      ctx.beginPath();
      ctx.arc(p.x, p.y, size * 1.24, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalCompositeOperation = "source-over";
    this.roses.forEach(function (r) {
      ctx.globalAlpha = 0.9;
      ctx.fillStyle = "#ff5f8f";
      ctx.beginPath();
      ctx.arc(r.x, r.y, r.size * 0.34, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#ffc2d5";
      ctx.beginPath();
      ctx.arc(r.x + 2, r.y - 2, r.size * 0.18, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
  };
  EffectEngine.prototype.start = function () {
    if (this.running) return;
    this.running = true;
    var self = this;
    function loop() {
      self.update();
      self.draw();
      if (self.running) requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
  };

  var state = new SceneStateManager();
  var audio = new AudioController();
  var effect = new EffectEngine(document.getElementById("fx-canvas"));
  effect.onBurst = function () { audio.cue("firework-burst", { critical: fireworksAmbientMode === "climax" }); };
  var app = document.getElementById("app");
  var openingTimer = null;
  var fireworksToken = 0;
  var fireworksAmbientTimer = null;
  var fireworksClimaxTimer = null;
  var fireworksAmbientMode = "normal";
  var focusMode = { active: false, itemId: null };
  var wallMotion = {
    targetX: 0,
    targetY: 0,
    x: 0,
    y: 0,
    orbitAngle: 0,
    orbitSpeed: 0.00145,
    cameraYaw: 0,
    cameraPitch: 0,
    targetPitch: 0,
    dragging: false,
    dragDistance: 0,
    lastX: 0,
    lastY: 0,
    paused: false,
    depth: 220,
  };

  var ui = {
    loading: document.getElementById("loading"),
    loadingTitle: document.querySelector(".loading-title"),
    heartFill: document.getElementById("heart-fill"),
    loadText: document.getElementById("load-text"),
    enterBtn: document.getElementById("enter-app"),
    modeSwitch: document.getElementById("mode-switch"),
    enableAudioBtn: document.getElementById("enable-audio"),
    navUp: document.getElementById("nav-up"),
    navDown: document.getElementById("nav-down"),
    scenes: document.querySelectorAll(".scene"),
    progressDots: document.querySelectorAll("[data-scene-dot]"),
    openingScene: document.getElementById("opening"),
    openingLine: document.getElementById("opening-line"),
    openingSubline: document.getElementById("opening-subline"),
    albumHint: document.querySelector("#album .album-hint"),
    albumWall: document.getElementById("album-wall"),
    albumProgress: document.getElementById("album-progress"),
    albumFocus: document.getElementById("album-focus"),
    albumFocusImage: document.getElementById("album-focus-image"),
    albumFocusTime: document.getElementById("album-focus-time"),
    albumFocusTitle: document.getElementById("album-focus-title"),
    albumFocusCaption: document.getElementById("album-focus-caption"),
    albumFocusClose: document.getElementById("album-focus-close"),
    fireworksScene: document.getElementById("fireworks"),
    proposalScene: document.getElementById("proposal"),
    proposalVowLine: document.getElementById("proposal-vow-line"),
    proposalVowSubline: document.getElementById("proposal-vow-subline"),
    proposalStageStatus: document.getElementById("proposal-stage-status"),
    proposalCta: document.getElementById("proposal-cta"),
    proposalMemoryTraces: document.getElementById("proposal-memory-traces"),
    vowCertificate: document.getElementById("vow-certificate"),
    certificateTitle: document.getElementById("certificate-title"),
    certificateLine1: document.getElementById("certificate-line1"),
    certificateLine2: document.getElementById("certificate-line2"),
    certificateLine3: document.getElementById("certificate-line3"),
    certificateSignerA: document.getElementById("certificate-signer-a"),
    certificateSignerB: document.getElementById("certificate-signer-b"),
    certificateDate: document.getElementById("certificate-date"),
    certificateEpilogue: document.getElementById("certificate-epilogue"),
    srStatus: document.getElementById("sr-status"),
  };

  if (reducedMotionMedia && typeof reducedMotionMedia.addEventListener === "function") {
    reducedMotionMedia.addEventListener("change", function (event) {
      isReducedMotion = !!event.matches;
    });
  } else if (reducedMotionMedia && typeof reducedMotionMedia.addListener === "function") {
    reducedMotionMedia.addListener(function (event) {
      isReducedMotion = !!event.matches;
    });
  }

  function markAction() {
    state.markUserAction();
  }

  function announceStatus(message) {
    if (!ui.srStatus) return;
    ui.srStatus.textContent = "";
    setTimeout(function () {
      ui.srStatus.textContent = message;
    }, 20);
  }

  function getFireworksStageProfile(stage) {
    var base = fireworksStageProfiles[stage] || fireworksStageProfiles.normal;
    if (!isReducedMotion) return base;
    return {
      chance: base.chance * 0.72,
      intervalMs: Math.floor(base.intervalMs * 1.32),
      burstMin: Math.max(64, Math.floor(base.burstMin * 0.62)),
      burstMax: Math.max(84, Math.floor(base.burstMax * 0.64)),
      vxSpread: base.vxSpread * 0.72,
      vyMin: base.vyMin * 0.82,
      vyMax: base.vyMax * 0.86,
    };
  }

  function applyFireworksTextProfile(name, baseOptions) {
    var profile = fireworksTextProfiles[name] || {};
    var reduced = profile.reduced || {};
    var colorAB = profile.colorAB || {};
    var opts = {};
    Object.keys(baseOptions || {}).forEach(function (k) { opts[k] = baseOptions[k]; });
    Object.keys(profile).forEach(function (k) {
      if (k === "reduced" || k === "colorAB" || k === "useABWhite") return;
      if (typeof profile[k] !== "undefined") opts[k] = profile[k];
    });
    if (isReducedMotion) {
      Object.keys(reduced).forEach(function (k) {
        if (typeof reduced[k] !== "undefined") opts[k] = reduced[k];
      });
    }
    if (profile.useABWhite && colorAB.white) {
      opts.color = colorAB.white;
    } else if (!opts.color && colorAB.whiteGold) {
      opts.color = colorAB.whiteGold;
    }
    return opts;
  }

  function setHeartProgress(percent) {
    var p = Math.max(0, Math.min(100, percent));
    ui.heartFill.style.clipPath = "inset(" + (100 - p) + "% 0 0 0)";
    ui.loadText.textContent = (uiCopy.loadingProgressPrefix || "") + p + "%";
  }

  function preloadImage(path) {
    return new Promise(function (resolve) {
      var done = false;
      var img = new Image();
      function finish(ok) {
        if (done) return;
        done = true;
        resolve(ok);
      }
      var timer = setTimeout(function () { finish(false); }, preloadImageTimeoutMs);
      img.onload = function () {
        clearTimeout(timer);
        finish(true);
      };
      img.onerror = function () {
        clearTimeout(timer);
        finish(false);
      };
      img.src = path;
    });
  }

  function preloadAudio(path) {
    return new Promise(function (resolve) {
      var done = false;
      var a = new Audio();
      function finish(ok) {
        if (done) return;
        done = true;
        a.src = "";
        resolve(ok);
      }
      var timer = setTimeout(function () { finish(false); }, preloadAudioTimeoutMs);
      a.preload = "auto";
      a.oncanplaythrough = function () {
        clearTimeout(timer);
        finish(true);
      };
      a.onerror = function () {
        clearTimeout(timer);
        finish(false);
      };
      a.src = path;
      a.load();
    });
  }

  function preloadRequiredAssets() {
    var criticalImages = [];
    albumData.forEach(function (item) {
      if (item.image) criticalImages.push(item.image);
    });
    var criticalAudio = [];
    if (audioConfig.bgm) criticalAudio.push(audioConfig.bgm);
    if (Array.isArray(audioConfig.firework)) criticalAudio = criticalAudio.concat(audioConfig.firework);
    if (Array.isArray(audioConfig.launch)) criticalAudio = criticalAudio.concat(audioConfig.launch);
    var uniqueImages = Array.from(new Set(criticalImages));
    var uniqueAudio = Array.from(new Set(criticalAudio));
    var total = uniqueImages.length + uniqueAudio.length;
    if (total === 0) return Promise.resolve({ unresolved: 0 });
    var done = 0;
    var unresolved = 0;
    function track(promise) {
      return promise.then(function (ok) {
        done += 1;
        if (!ok) unresolved += 1;
        setHeartProgress(Math.round((done / total) * 100));
      });
    }
    var loaders = [];
    uniqueImages.forEach(function (path) { loaders.push(track(preloadImage(path))); });
    uniqueAudio.forEach(function (path) { loaders.push(track(preloadAudio(path))); });
    return Promise.all(loaders).then(function () { return { unresolved: unresolved }; });
  }

  function sceneTransition(sceneId) {
    ui.scenes.forEach(function (s) {
      var active = s.id === sceneId;
      s.hidden = !active;
      s.classList.toggle("active", active);
    });
    ui.progressDots.forEach(function (dot) {
      dot.classList.toggle("active", dot.getAttribute("data-scene-dot") === sceneId);
    });
    document.body.setAttribute("data-scene", sceneId);
  }

  function updateModeBtn() {
    ui.modeSwitch.textContent = state.mode === "free"
      ? (uiCopy.modeFreeSymbol || ui.modeSwitch.textContent)
      : (uiCopy.modeAutoSymbol || ui.modeSwitch.textContent);
    ui.modeSwitch.title = state.mode === "free"
      ? (uiCopy.modeFreeTitle || ui.modeSwitch.title)
      : (uiCopy.modeAutoTitle || ui.modeSwitch.title);
  }

  function startOpeningAutoplay() {
    if (openingTimer) clearTimeout(openingTimer);
    ui.openingScene.classList.remove("opening-done");
    if (!scriptData.opening.length) {
      ui.openingLine.textContent = "";
      ui.openingSubline.textContent = uiCopy.openingDoneSubline || "";
      return;
    }
    var i = 0;
    function typeLine(line, cb) {
      var cursor = 0;
      ui.openingLine.textContent = "";
      function tick() {
        if (state.getCurrentScene() !== "opening") return;
        cursor += 1;
        ui.openingLine.textContent = line.slice(0, cursor);
        if (cursor < line.length) {
          openingTimer = setTimeout(tick, openingTiming.typeCharMs);
        } else {
          openingTimer = setTimeout(cb, openingTiming.linePauseMs);
        }
      }
      tick();
    }
    function playLine() {
      if (state.getCurrentScene() !== "opening") return;
      ui.openingSubline.textContent = formatCopy(
        uiCopy.openingProgressTemplate || "{current}/{total}",
        { current: i + 1, total: scriptData.opening.length }
      );
      typeLine(scriptData.opening[i], function () {
        i += 1;
        if (i < scriptData.opening.length) {
          playLine();
        } else {
          ui.openingSubline.textContent = uiCopy.openingDoneSubline || "";
          ui.openingScene.classList.add("opening-done");
        }
      });
    }
    playLine();
  }

  function getAlbumDepth() {
    return Math.max(120, Math.min(280, window.innerWidth * (window.innerWidth < 820 ? 0.22 : 0.18)));
  }

  function updateAlbumWallTransforms() {
    var cards = ui.albumWall.querySelectorAll(".album-card");
    var now = Date.now() * 0.001;
    var sinYaw = Math.sin(wallMotion.cameraYaw);
    var cosYaw = Math.cos(wallMotion.cameraYaw);
    var sinPitch = Math.sin(wallMotion.cameraPitch);
    var cosPitch = Math.cos(wallMotion.cameraPitch);
    var focal = window.innerWidth < 820 ? 560 : 780;
    for (var i = 0; i < cards.length; i++) {
      var card = cards[i];
      var baseAngle = Number(card.dataset.baseAngle || "0");
      var ringRadius = Number(card.dataset.ringRadius || "0");
      var layerY = Number(card.dataset.layerY || "0");
      var floatSeed = Number(card.dataset.floatSeed || "0");
      var floatAmp = Number(card.dataset.floatAmp || "0");
      var spinSpeed = Number(card.dataset.spinSpeed || "0");
      var tiltSeed = Number(card.dataset.tiltSeed || "0");
      var angle = baseAngle + wallMotion.orbitAngle;
      var orbitX = Math.cos(angle) * ringRadius;
      var orbitZ = Math.sin(angle) * ringRadius;
      var floatX = Math.cos(now * 0.48 + floatSeed * 1.7) * floatAmp * 0.36;
      var floatY = Math.sin(now * 0.62 + floatSeed) * floatAmp * 0.9;
      var floatZ = Math.cos(now * 0.58 + floatSeed * 0.82) * 22;
      var worldX = orbitX + wallMotion.x + floatX;
      var worldY = layerY + wallMotion.y + floatY;
      var worldZ = orbitZ + floatZ;

      // Camera transform: treat screen as viewer perspective.
      var x1 = worldX * cosYaw - worldZ * sinYaw;
      var z1 = worldX * sinYaw + worldZ * cosYaw;
      var y2 = worldY * cosPitch - z1 * sinPitch;
      var z2 = worldY * sinPitch + z1 * cosPitch;

      var persp = focal / Math.max(220, focal + z2 + ringRadius * 1.1);
      var tx = x1 * persp;
      var ty = y2 * persp;
      var tz = z2 * 0.52;
      var depthN = (z2 + ringRadius) / Math.max(ringRadius * 2, 1);
      var scale = (0.72 + depthN * 0.46) * persp;
      var alpha = Math.max(0.2, Math.min(1, (0.34 + depthN * 0.62) * (0.7 + persp * 0.4)));
      var rotZ = Math.sin(now * spinSpeed + floatSeed) * 5.2;
      var rotX = Math.sin(now * (0.45 + tiltSeed * 0.08) + floatSeed * 0.6) * 4.2 + wallMotion.cameraPitch * 20;
      var rotY = (-Math.atan2(x1, z1 + 0.001) * 180 / Math.PI) * 0.45 + Math.cos(now * (0.42 + tiltSeed * 0.04) + floatSeed) * 5.6;
      card.classList.remove("spotlight");
      card.style.opacity = String(alpha);
      card.style.zIndex = String(380 + Math.round(tz));
      card.style.transform =
        "translate(-50%, -50%) " +
        "translate3d(" + tx + "px," + ty + "px," + tz + "px) " +
        "rotateX(" + rotX.toFixed(2) + "deg) " +
        "rotateY(" + rotY.toFixed(2) + "deg) " +
        "rotateZ(" + rotZ.toFixed(2) + "deg) " +
        "scale(" + scale.toFixed(3) + ")";
    }
  }

  function renderAlbumWall() {
    ui.albumWall.innerHTML = "";
    var cardW = Math.min(192, Math.max(108, Math.floor(window.innerWidth * (window.innerWidth < 820 ? 0.28 : 0.15))));
    var wallHeight = window.innerWidth < 820 ? Math.max(420, Math.floor(window.innerHeight * 0.7)) : Math.max(520, Math.floor(window.innerHeight * 0.74));
    ui.albumWall.style.height = wallHeight + "px";
    var baseRadius = window.innerWidth < 820
      ? Math.max(190, Math.min(280, window.innerWidth * 0.46))
      : Math.max(280, Math.min(460, window.innerWidth * 0.34));
    var layers = window.innerWidth < 820 ? 3 : 2;

    albumData.forEach(function (item, idx) {
      var card = document.createElement("button");
      card.type = "button";
      card.className = "album-card";
      card.style.width = cardW + "px";
      if (state.viewedAlbum.has(item.id)) card.classList.add("seen");

      var layer = idx % layers;
      var aroundIndex = Math.floor(idx / layers);
      var perLayer = Math.ceil(albumData.length / layers);
      var baseAngle = ((Math.PI * 2) / perLayer) * aroundIndex + (layer * Math.PI / perLayer);
      var layerOffset = ((layer - (layers - 1) / 2) * (window.innerWidth < 820 ? 120 : 140));
      card.dataset.baseAngle = String(baseAngle);
      card.dataset.ringRadius = String(baseRadius + layer * 34);
      card.dataset.layerY = String(layerOffset);
      card.dataset.itemId = String(item.id);
      card.dataset.floatSeed = String((idx + 1) * 0.73);
      card.dataset.floatAmp = String(12 + (idx % 5) * 2.4);
      card.dataset.spinSpeed = String(0.28 + (idx % 6) * 0.04);
      card.dataset.tiltSeed = String((idx % 7) * 0.21 + 0.3);

      var img = document.createElement("img");
      img.alt = item.title;
      img.loading = "lazy";
      img.style.aspectRatio = item.ratio;
      img.style.objectPosition = item.focus.x + "% " + item.focus.y + "%";
      img.src = item.image;
      img.onerror = function () { img.src = makeFallback(item.title); };

      var content = document.createElement("div");
      content.className = "album-card-content";
      var time = document.createElement("span");
      time.className = "album-card-time";
      time.textContent = item.time;
      var title = document.createElement("span");
      title.className = "album-card-title";
      title.textContent = item.title;
      content.append(time, title);
      card.append(img, content);

      card.addEventListener("click", function () {
        if (wallMotion.dragDistance > 8) return;
        if (focusMode.active && focusMode.itemId === item.id) closeFocus();
        else openFocus(item);
        markAction();
      });

      ui.albumWall.append(card);
    });

    updateAlbumWallTransforms();
    updateAlbumProgress();
  }

  function updateAlbumProgress() {
    var total = albumData.length;
    var viewed = state.viewedAlbum.size;
    ui.albumProgress.textContent = formatCopy(
      uiCopy.albumProgressTemplate || "{viewed}/{total}",
      { viewed: viewed, total: total }
    );
    if (viewed >= total) ui.albumProgress.textContent += (uiCopy.albumProgressUnlockedSuffix || "");
  }

  function openFocus(item) {
    focusMode.active = true;
    focusMode.itemId = item.id;
    wallMotion.paused = true;
    ui.albumFocus.hidden = false;
    ui.albumFocusImage.src = item.image;
    ui.albumFocusImage.onerror = function () { ui.albumFocusImage.src = makeFallback(item.title); };
    ui.albumFocusImage.style.objectPosition = item.focus.x + "% " + item.focus.y + "%";
    ui.albumFocusTime.textContent = item.time;
    ui.albumFocusTitle.textContent = item.title;
    ui.albumFocusCaption.textContent = item.caption;
    state.markAlbumViewed(item.id);
    audio.cue("open");
  }

  function closeFocus() {
    focusMode.active = false;
    focusMode.itemId = null;
    wallMotion.paused = false;
    ui.albumFocus.hidden = true;
    audio.cue("close");
  }

  function animateAlbumWall() {
    function frame() {
      if (!wallMotion.paused) {
        wallMotion.orbitAngle += wallMotion.orbitSpeed;
        wallMotion.cameraYaw += 0.00045;
        if (!wallMotion.dragging) {
          wallMotion.targetX *= 0.92;
          wallMotion.targetY *= 0.92;
          wallMotion.targetPitch *= 0.96;
        }
        wallMotion.x += (wallMotion.targetX - wallMotion.x) * 0.08;
        wallMotion.y += (wallMotion.targetY - wallMotion.y) * 0.08;
        wallMotion.cameraPitch += (wallMotion.targetPitch - wallMotion.cameraPitch) * 0.08;
        updateAlbumWallTransforms();
      }
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  function beginFireworksTimeline() {
    var token = Date.now();
    fireworksToken = token;
    fireworksAmbientMode = "build";
    fireworksReadyForProposalAt = 0;
    function ensure() {
      return fireworksToken === token && state.getCurrentScene() === "fireworks";
    }
    function showParticleText(text, duration, opts) {
      if (!ensure()) return;
      fireworksTextWindowUntil = Date.now() + Math.max(0, duration);
      effect.composeText(text, duration, opts);
    }
    function queueParticleText(text, profileName, baseOpts, durationCfg) {
      var message = (text || "").trim();
      if (!message) return;
      var narrow = window.innerWidth < 820;
      var defaultMaxChars = narrow ? 6 : 8;
      var defaultMaxLines = 3;
      var maxChars = baseOpts.maxChars || defaultMaxChars;
      var maxLines = baseOpts.maxLines || defaultMaxLines;
      var expandedMaxLines = Math.min(3, Math.max(1, maxLines));
      var segments = splitParticleTextSegments(message, maxChars, expandedMaxLines);
      if (segments.length === 0) return;
      segments.forEach(function (segment, index) {
        var normalized = segment.replace(/\s+/g, "");
        var length = Array.from(normalized).length;
        var duration = getParticleTextDuration(segment, durationCfg.minMs, durationCfg.perCharMs, durationCfg.maxMs);
        if (length >= (durationCfg.longThreshold || 12)) {
          duration += durationCfg.longHoldBonusMs || 260;
          duration = Math.min(durationCfg.longHoldCapMs || (durationCfg.maxMs + 420), duration);
        }
        if (segments.length > 1) {
          duration = Math.max(durationCfg.segmentMinMs || 1200, duration - (durationCfg.segmentCutMs || 180));
        }
        setTimeout(function () {
          if (!ensure()) return;
          var segmentOpts = {};
          Object.keys(baseOpts || {}).forEach(function (k) { segmentOpts[k] = baseOpts[k]; });
          segmentOpts.maxChars = maxChars;
          segmentOpts.maxLines = expandedMaxLines;
          showParticleText(segment, duration, applyFireworksTextProfile(profileName, segmentOpts));
        }, t);
        t += duration + (index === segments.length - 1 ? (durationCfg.afterGapMs || 360) : (durationCfg.segmentGapMs || 220));
      });
    }
    var t = 0;
    scriptData.fireworks.countdown.forEach(function (n, idx) {
      setTimeout(function () {
        if (!ensure()) return;
        showParticleText(n, Math.max(fireworksTextMinDwellMs, 1300), applyFireworksTextProfile("countdown", {
          color: n === "1" ? "#f7fbff" : "#f5f8ff",
          fontSize: Math.min(210, Math.max(120, Math.floor(window.innerWidth * 0.34))),
          sampleStep: isReducedMotion ? 3 : 2,
          pixelSize: isReducedMotion ? 3.8 : 3.2,
          maxLines: 1,
          scatterStartRatio: 0.82,
          fadeStartRatio: 0.8,
          approachLerp: 0.24,
          jitterMin: 0.03,
          jitterMax: isReducedMotion ? 0.12 : 0.2,
        }));
        audio.cue("count-" + n);
      }, t);
      t += 1000;
      if (idx === scriptData.fireworks.countdown.length - 1) {
        setTimeout(function () {
          if (!ensure()) return;
          effect.textParticles = [];
        }, t);
      }
    });
    scriptData.fireworks.stagedLines.forEach(function (line) {
      queueParticleText(line, "staged", {
        color: "#f5f8ff",
        fontSize: window.innerWidth < 820 ? 72 : 88,
        sampleStep: isReducedMotion ? 3 : 2,
        pixelSize: isReducedMotion ? 2.9 : 2.5,
        maxChars: window.innerWidth < 820 ? 5 : 8,
        maxLines: 3,
        scatterStartRatio: 0.82,
        fadeStartRatio: 0.78,
        approachLerp: 0.24,
        jitterMin: 0.02,
        jitterMax: isReducedMotion ? 0.06 : 0.1,
      }, {
        minMs: 1900,
        perCharMs: 95,
        maxMs: 3600,
        longThreshold: 10,
        longHoldBonusMs: 420,
        longHoldCapMs: 4100,
        segmentMinMs: 1500,
        segmentCutMs: 180,
        segmentGapMs: 200,
        afterGapMs: 420
      });
    });
    setTimeout(function () {
      if (!ensure()) return;
      // 用户要求移除高潮燃放段：保留文字表达，不再追加高潮烟花发射。
      fireworksAmbientMode = "tail";
        queueParticleText(scriptData.fireworks.climaxWord, "climax", {
          color: "#f6faff",
          fontSize: window.innerWidth < 820 ? 88 : 122,
          sampleStep: isReducedMotion ? 3 : 2,
          pixelSize: isReducedMotion ? 3.2 : 2.8,
          maxChars: window.innerWidth < 820 ? 6 : 8,
          maxLines: 2,
          scatterStartRatio: 0.82,
          fadeStartRatio: 0.8,
          approachLerp: 0.24,
        }, {
          minMs: 1900,
          perCharMs: 95,
          maxMs: 3600,
          longThreshold: 9,
          longHoldBonusMs: 360,
          longHoldCapMs: 4000,
          segmentMinMs: 1200,
          segmentCutMs: 150,
          segmentGapMs: 180,
          afterGapMs: 340
        });
        audio.cue("firework-burst", { critical: false });
      }, t);
    t += 600;
    scriptData.fireworks.composeWords.forEach(function (word) {
      var wordStartAt = t;
      queueParticleText(word, "compose", {
        sampleStep: isReducedMotion ? 3 : 2,
        pixelSize: isReducedMotion ? 3.0 : 2.6,
        color: "#f6faff",
        maxChars: window.innerWidth < 820 ? 5 : 8,
        maxLines: 3,
        scatterStartRatio: 0.84,
        fadeStartRatio: 0.8,
        approachLerp: 0.24,
        jitterMin: 0.02,
        jitterMax: isReducedMotion ? 0.06 : 0.1,
      }, {
        minMs: 2100,
        perCharMs: 110,
        maxMs: 4200,
        longThreshold: 10,
        longHoldBonusMs: 620,
        longHoldCapMs: 4700,
        segmentMinMs: 1700,
        segmentCutMs: 160,
        segmentGapMs: 210,
        afterGapMs: 420
      });
      setTimeout(function () {
        if (!ensure()) return;
        fireworksAmbientMode = "tail";
        audio.cue("firework-launch");
      }, Math.max(0, wordStartAt));
    });
    setTimeout(function () {
      if (!ensure()) return;
      fireworksAmbientMode = "normal";
      fireworksReadyForProposalAt = Date.now() + autoRhythm.fireworks.postClimaxHoldMs;
    }, t + 800);
  }

  function startFireworksAmbient() {
    if (fireworksAmbientTimer) clearInterval(fireworksAmbientTimer);
    var lastLaunchAt = 0;
    fireworksAmbientTimer = setInterval(function () {
      if (state.getCurrentScene() !== "fireworks") return;
      var profile = getFireworksStageProfile(fireworksAmbientMode);
      var textWindowActive = Date.now() < fireworksTextWindowUntil || effect.textParticles.length > 0;
      var chanceScale = textWindowActive ? 0.52 : 1;
      var burstScale = textWindowActive ? 0.68 : 1;
      var now = Date.now();
      if (now - lastLaunchAt < profile.intervalMs) return;
      if (Math.random() > profile.chance * chanceScale) return;
      var baseBurstCount = profile.burstMin + Math.floor(Math.random() * Math.max(8, profile.burstMax - profile.burstMin));
      var burstCount = Math.max(48, Math.floor(baseBurstCount * burstScale));
      effect.launchFirework(
        20 + Math.random() * (window.innerWidth - 40),
        randomBurstTargetY(fireworksAmbientMode),
        burstCount,
        {
          stage: fireworksAmbientMode,
          vxSpread: profile.vxSpread,
          vyMin: profile.vyMin,
          vyMax: profile.vyMax,
          intensity: fireworksAmbientMode === "climax" ? 1.15 : fireworksAmbientMode === "tail" ? 0.92 : 1
        }
      );
      lastLaunchAt = now;
      audio.cue("firework-launch");
    }, fireworksAmbientTickMs);
  }

  function stopFireworksAmbient() {
    if (fireworksAmbientTimer) {
      clearInterval(fireworksAmbientTimer);
      fireworksAmbientTimer = null;
    }
    if (fireworksClimaxTimer) {
      clearInterval(fireworksClimaxTimer);
      fireworksClimaxTimer = null;
    }
    fireworksAmbientMode = "normal";
  }

  function applyProposalContent() {
    ui.proposalCta.textContent = scriptData.proposal.cta;
    ui.proposalVowSubline.textContent = "";
    ui.certificateTitle.textContent = scriptData.proposal.certificateTitle;
    ui.certificateLine1.textContent = scriptData.proposal.certificateLines[0];
    ui.certificateLine2.textContent = scriptData.proposal.certificateLines[1];
    ui.certificateLine3.textContent = scriptData.proposal.certificateLines[2];
    ui.certificateSignerA.textContent = scriptData.proposal.signerA;
    ui.certificateSignerB.textContent = scriptData.proposal.signerB;
    ui.certificateDate.textContent = scriptData.proposal.dateLabel;
    ui.certificateEpilogue.textContent = scriptData.proposal.epilogue;
  }

  function announceProposalStage(message) {
    if (ui.proposalStageStatus) ui.proposalStageStatus.textContent = message || "";
    announceStatus(message || "");
  }

  function setProposalState(nextState) {
    proposalState = nextState;
    if (ui.proposalScene) ui.proposalScene.setAttribute("data-proposal-state", nextState);
  }

  function clearProposalMemoryTraces() {
    if (!ui.proposalMemoryTraces) return;
    ui.proposalMemoryTraces.innerHTML = "";
  }

  function spawnProposalMemoryTrace() {
    if (!ui.proposalMemoryTraces || state.getCurrentScene() !== "proposal") return;
    if (proposalState === proposalStates.CONFIRMED) return;
    var words = scriptData.proposal.memoryKeywords || [];
    if (words.length === 0) return;
    var trace = document.createElement("span");
    trace.className = "memory-trace";
    trace.textContent = words[Math.floor(Math.random() * words.length)];
    var side = Math.random() > 0.5 ? "left" : "right";
    trace.style[side] = (8 + Math.random() * 20).toFixed(1) + "%";
    trace.style.top = (24 + Math.random() * 54).toFixed(1) + "%";
    ui.proposalMemoryTraces.append(trace);
    setTimeout(function () {
      if (trace.parentNode) trace.parentNode.removeChild(trace);
    }, proposalMemoryTraceLifeMs);
  }

  function startProposalMemoryAmbient() {
    if (proposalMemoryTimer) clearInterval(proposalMemoryTimer);
    spawnProposalMemoryTrace();
    proposalMemoryTimer = setInterval(function () {
      spawnProposalMemoryTrace();
    }, isReducedMotion ? proposalMemoryAmbientReducedMs : proposalMemoryAmbientMs);
  }

  function stopProposalMemoryAmbient() {
    if (proposalMemoryTimer) {
      clearInterval(proposalMemoryTimer);
      proposalMemoryTimer = null;
    }
    clearProposalMemoryTraces();
  }

  function showProposalVow(index) {
    var text = scriptData.proposal.vows[index];
    if (!text) return;
    ui.proposalVowLine.classList.remove("visible");
    void ui.proposalVowLine.offsetWidth;
    ui.proposalVowLine.textContent = text;
    ui.proposalVowLine.classList.add("visible");
    ui.proposalVowSubline.textContent = scriptData.proposal.subline;
  }

  function resetProposalSceneVisuals() {
    if (!ui.proposalScene) return;
    ui.proposalScene.classList.remove("warm");
    ui.proposalCta.hidden = true;
    ui.proposalCta.disabled = true;
    ui.vowCertificate.hidden = true;
    ui.vowCertificate.classList.remove("visible");
    ui.certificateSignerA.classList.remove("signed");
    ui.certificateSignerB.classList.remove("signed");
    ui.proposalVowLine.classList.remove("visible");
    ui.proposalVowLine.textContent = "";
    ui.proposalVowSubline.textContent = "";
    announceProposalStage("");
  }

  function beginProposalTimeline() {
    proposalToken += 1;
    var token = proposalToken;
    resetProposalSceneVisuals();
    setProposalState(proposalStates.INTRO);
    startProposalMemoryAmbient();
    announceProposalStage(uiCopy.proposalIntroAnnouncement || "");
    function ensure() {
      return token === proposalToken && state.getCurrentScene() === "proposal";
    }
    function schedule(ms, fn) {
      setTimeout(function () {
        if (!ensure()) return;
        fn();
      }, ms);
    }
    schedule(proposalRhythm.introMs, function () {
      setProposalState(proposalStates.VOW1);
      showProposalVow(0);
      announceProposalStage(uiCopy.proposalFirstAnnouncement || "");
    });
    schedule(proposalRhythm.introMs + proposalRhythm.revealMs + proposalRhythm.holdMs + proposalRhythm.transitionMs, function () {
      setProposalState(proposalStates.VOW2);
      showProposalVow(1);
      announceProposalStage(uiCopy.proposalSecondAnnouncement || "");
    });
    schedule(proposalRhythm.introMs + (proposalRhythm.revealMs + proposalRhythm.holdMs + proposalRhythm.transitionMs) * 2, function () {
      setProposalState(proposalStates.VOW3);
      showProposalVow(2);
      announceProposalStage(uiCopy.proposalThirdAnnouncement || "");
    });
    schedule(proposalRhythm.introMs + (proposalRhythm.revealMs + proposalRhythm.holdMs + proposalRhythm.transitionMs) * 3, function () {
      setProposalState(proposalStates.GATE_WAITING);
      ui.proposalCta.hidden = false;
      ui.proposalCta.disabled = false;
      ui.proposalCta.focus();
      announceProposalStage(scriptData.proposal.stageReadyAnnouncement);
    });
  }

  function confirmProposalVow() {
    if (proposalState !== proposalStates.GATE_WAITING) return;
    setProposalState(proposalStates.CONFIRMED);
    ui.proposalCta.disabled = true;
    ui.proposalCta.hidden = true;
    ui.proposalScene.classList.add("warm");
    setTimeout(function () {
      if (state.getCurrentScene() !== "proposal") return;
      ui.vowCertificate.hidden = false;
      ui.vowCertificate.classList.add("visible");
    }, proposalRhythm.warmDelayMs);
    setTimeout(function () {
      if (state.getCurrentScene() !== "proposal") return;
      ui.certificateSignerA.classList.add("signed");
    }, proposalRhythm.warmDelayMs + proposalRhythm.signerDelayMs);
    setTimeout(function () {
      if (state.getCurrentScene() !== "proposal") return;
      ui.certificateSignerB.classList.add("signed");
    }, proposalRhythm.warmDelayMs + proposalRhythm.signerDelayMs + proposalRhythm.signerGapMs);
    audio.cue("success");
    announceProposalStage(scriptData.proposal.successAnnouncement);
    stopProposalMemoryAmbient();
  }

  function onSceneEnter(sceneId) {
    sceneEnteredAt = Date.now();
    document.body.classList.toggle("fireworks-immersive", sceneId === "fireworks");
    if (sceneId !== "fireworks") {
      stopFireworksAmbient();
      fireworksReadyForProposalAt = 0;
    }
    if (sceneId !== "proposal") {
      proposalToken += 1;
      stopProposalMemoryAmbient();
      if (ui.proposalScene) ui.proposalScene.classList.remove("warm");
    }
    if (sceneId === "opening") startOpeningAutoplay();
    if (sceneId === "album") renderAlbumWall();
    if (sceneId === "fireworks") {
      beginFireworksTimeline();
      startFireworksAmbient();
    }
    if (sceneId === "proposal") beginProposalTimeline();
  }

  function bindActivityTracker() {
    ["click", "touchstart", "touchmove", "scroll", "keydown", "pointerdown", "pointermove"].forEach(function (evt) {
      window.addEventListener(evt, markAction, { passive: true });
    });
  }

  function bindInteractions() {
    ui.modeSwitch.addEventListener("click", function () {
      state.setMode(state.mode === "free" ? "auto" : "free");
      updateModeBtn();
      markAction();
    });
    ui.enableAudioBtn.addEventListener("click", async function () {
      if (!audio.enabled) {
        await audio.enable();
        ui.enableAudioBtn.textContent = uiCopy.audioSymbolOn || ui.enableAudioBtn.textContent;
        ui.enableAudioBtn.title = uiCopy.audioTitleOn || ui.enableAudioBtn.title;
      } else {
        var on = audio.toggleMute();
        ui.enableAudioBtn.textContent = on ? (uiCopy.audioSymbolOn || ui.enableAudioBtn.textContent) : (uiCopy.audioSymbolOff || ui.enableAudioBtn.textContent);
        ui.enableAudioBtn.title = on ? (uiCopy.audioTitleOn || ui.enableAudioBtn.title) : (uiCopy.audioTitleOff || ui.enableAudioBtn.title);
      }
      markAction();
    });

    ui.navUp.addEventListener("click", function () { state.goStep(-1); });
    ui.navDown.addEventListener("click", function () { state.goStep(1); });

    window.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && focusMode.active) {
        closeFocus();
        markAction();
      }
      if ((e.key === "Enter" || e.key === " ") &&
        document.activeElement === ui.proposalCta &&
        proposalState === proposalStates.GATE_WAITING) {
        e.preventDefault();
        confirmProposalVow();
        markAction();
      }
      if (e.key === "ArrowUp" && !focusMode.active) {
        state.goStep(-1);
      }
      if (e.key === "ArrowDown" && !focusMode.active) {
        state.goStep(1);
      }
    });

    ui.albumFocusClose.addEventListener("click", function () {
      closeFocus();
      markAction();
    });
    ui.albumFocusImage.addEventListener("click", function () {
      if (!focusMode.active) return;
      closeFocus();
      markAction();
    });
    ui.albumFocus.addEventListener("click", function (e) {
      if (!focusMode.active) return;
      if (e.target === ui.albumFocus) {
        closeFocus();
        markAction();
      }
    });

    ui.fireworksScene.addEventListener("click", function (e) {
      effect.setPointer(e.clientX, e.clientY);
      effect.launchFirework(e.clientX, e.clientY, isReducedMotion ? 20 : 36);
      audio.cue("firework-launch");
      markAction();
    });
    ui.fireworksScene.addEventListener("pointermove", function (e) {
      effect.setPointer(e.clientX, e.clientY);
    }, { passive: true });

    ui.proposalCta.addEventListener("click", function () {
      if (proposalState !== proposalStates.GATE_WAITING) return;
      confirmProposalVow();
      markAction();
    });

    var wall = ui.albumWall;
    wall.addEventListener("pointerdown", function (e) {
      if (focusMode.active) return;
      wall.setPointerCapture(e.pointerId);
      wallMotion.dragging = true;
      wallMotion.lastX = e.clientX;
      wallMotion.lastY = e.clientY;
      wallMotion.dragDistance = 0;
      markAction();
    });
    wall.addEventListener("pointermove", function (e) {
      if (!wallMotion.dragging || focusMode.active) return;
      var dx = e.clientX - wallMotion.lastX;
      var dy = e.clientY - wallMotion.lastY;
      wallMotion.lastX = e.clientX;
      wallMotion.lastY = e.clientY;
      wallMotion.dragDistance += Math.abs(dx) + Math.abs(dy) * 0.4;
      wallMotion.cameraYaw += dx * 0.0038;
      wallMotion.targetPitch += dy * 0.0011;
      if (wallMotion.targetPitch > 0.36) wallMotion.targetPitch = 0.36;
      if (wallMotion.targetPitch < -0.36) wallMotion.targetPitch = -0.36;
      wallMotion.targetX += dx * 0.18;
      wallMotion.targetY += dy * 0.12;
    });
    wall.addEventListener("pointerup", function () {
      wallMotion.dragging = false;
      setTimeout(function () { wallMotion.dragDistance = 0; }, 30);
    });
    wall.addEventListener("pointercancel", function () {
      wallMotion.dragging = false;
      wallMotion.dragDistance = 0;
    });
  }

  function bindState() {
    var lastScene = null;
    state.subscribe(function (sceneId) {
      if (sceneId !== "album" && focusMode.active) closeFocus();
      if (lastScene === "fireworks" && sceneId === "proposal") {
        app.classList.remove("soft-cut");
        void app.offsetWidth;
        app.classList.add("soft-cut");
        setTimeout(function () { app.classList.remove("soft-cut"); }, 640);
      }
      sceneTransition(sceneId);
      updateModeBtn();
      updateAlbumProgress();
      if (sceneId !== lastScene) {
        onSceneEnter(sceneId);
        lastScene = sceneId;
      }
    });
  }

  function runAutoModeClock() {
    setInterval(function () {
      if (focusMode.active && Date.now() - state.lastUserAction >= focusAutoCloseInactiveMs) closeFocus();
      if (state.mode !== "auto") return;
      if (focusMode.active) return;
      var currentScene = state.getCurrentScene();
      if (currentScene === "proposal" && autoRhythm.proposal.lockScene) return;

      var elapsedSinceEnter = Date.now() - sceneEnteredAt;
      var elapsedSinceAction = Date.now() - state.lastUserAction;
      var dwellMs = autoRhythm[currentScene] && autoRhythm[currentScene].dwellMs
        ? autoRhythm[currentScene].dwellMs
        : toNumber(autoRhythm.proposal && autoRhythm.proposal.dwellMs, 60000);

      if (currentScene === "album" && elapsedSinceAction < albumActiveActionMs) {
        dwellMs = autoRhythm.album.activeDwellMs;
      }
      if (currentScene === "fireworks" && fireworksReadyForProposalAt > Date.now()) {
        return;
      }
      if (elapsedSinceEnter < dwellMs) return;

      var next = state.currentSceneIndex + 1 > sceneOrder.length - 1 ? 0 : state.currentSceneIndex + 1;
      state.goToScene(sceneOrder[next], false);
      state.lastUserAction = Date.now();
    }, autoModeTickMs);
  }

  async function bootstrap() {
    if (ui.loadingTitle) ui.loadingTitle.textContent = uiCopy.loadingTitle || ui.loadingTitle.textContent;
    if (ui.albumHint) ui.albumHint.textContent = uiCopy.albumHint || ui.albumHint.textContent;
    if (ui.enterBtn) ui.enterBtn.textContent = uiCopy.loadingButtonInit || ui.enterBtn.textContent;
    if (ui.enableAudioBtn) {
      ui.enableAudioBtn.textContent = uiCopy.audioSymbolOff || ui.enableAudioBtn.textContent;
      ui.enableAudioBtn.title = uiCopy.audioTitleOff || ui.enableAudioBtn.title;
    }
    updateModeBtn();
    applyProposalContent();
    bindActivityTracker();
    bindInteractions();
    bindState();
    renderAlbumWall();
    animateAlbumWall();
    window.addEventListener("resize", function () {
      wallMotion.depth = getAlbumDepth();
      renderAlbumWall();
    });

    var loadResult = await preloadRequiredAssets();
    if (loadResult.unresolved > 0) {
      ui.loadText.textContent = formatCopy(
        uiCopy.loadingErrorTemplate || "{count}",
        { count: loadResult.unresolved }
      );
    }
    setHeartProgress(100);
    ui.loading.classList.add("heart-ready");
    ui.enterBtn.disabled = false;
    ui.enterBtn.textContent = uiCopy.loadingCompleteButton || ui.enterBtn.textContent;
    announceStatus(uiCopy.loadingCompleteStatus || "");
    ui.enterBtn.focus();
    ui.enterBtn.addEventListener("click", function () {
      ui.loading.classList.add("hidden");
      app.hidden = false;
      state.goToScene("opening", false);
      effect.start();
      if (!audio.enabled && pick("flags.autoEnableAudioOnEnter", true)) {
        audio.enable().then(function () {
          ui.enableAudioBtn.textContent = uiCopy.audioSymbolOn || ui.enableAudioBtn.textContent;
          ui.enableAudioBtn.title = uiCopy.audioTitleOn || ui.enableAudioBtn.title;
        }).catch(function () { });
      }
      if (ui.modeSwitch) ui.modeSwitch.focus();
    }, { once: true });
    runAutoModeClock();
  }

  bootstrap();
})();
