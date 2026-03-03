(function () {
  // 统一运行时配置：所有文案、资源路径、开关和参数都从这里维护。
  window.APP_CONFIG = {
    // 场景顺序（自由/自动模式都依赖此顺序）
    sceneOrder: ["opening", "album", "fireworks", "proposal"],

    content: {
      // 全局人物名称：所有涉及人物称呼的文案都通过占位符引用
      people: {
        maleName: "飞飞",
        femaleName: "君君"
      },

      // 相册内容数据
      albumData: [
        { id: 1, time: "2025.11.30", title: "候鸟公园", caption: "第一次见面，{maleName}一路紧张又期待，怕自己不够好。结果见到{femaleName}后，所有不安都变成了安心，我们一起逛街、合照、喂天鹅，那天像故事的第一页。", focus: { x: 50, y: 35 }, ratio: "3 / 4" },
        { id: 2, time: "2025.12.25", title: "特殊的日子", caption: "第一次陪{femaleName}过生日，礼物和蛋糕分开准备了（捂脸）。礼物先到时，{maleName}一直忐忑你会不会喜欢，送的是手表，之前你说打比赛的时候因为要关注时间，还特地去借了同学的手表，现在可以不用去借了^_^。", focus: { x: 50, y: 36 }, ratio: "4 / 5" },
        { id: 3, time: "2025.12.27", title: "大梅沙", caption: "像是{femaleName}第一次认真看海。那天天气和风都很配合，海边很美，你离开时还笑着说想带一点海水回去，快乐就这样被我们装进口袋。", focus: { x: 50, y: 38 }, ratio: "4 / 3" },
        { id: 4, time: "2026.01.02", title: "虹桥公园", caption: "走进爱情长廊时，路不算长，却被我们走得很慢。那天没说很多大道理，只是并肩走着，就觉得未来也可以这样一直走下去。", focus: { x: 50, y: 34 }, ratio: "3 / 4" },
        { id: 5, time: "2026.01.02", title: "一起吃西餐", caption: "那顿西餐不只是味道不错，更像一次默契加深，{maleName}忽然觉得，和你一起吃饭这件小事，本身就很浪漫。", focus: { x: 50, y: 33 }, ratio: "4 / 3" },
        { id: 6, time: "2026.01.03", title: "红树湾公园", caption: "我们一起等日落，天色慢慢变暖又变暗。那一刻没有急着拍照，只想把你站在晚霞里的样子，认真记进{maleName}的心里。", focus: { x: 50, y: 35 }, ratio: "3 / 4" },
        { id: 7, time: "2026.01.05", title: "石岩公园", caption: "{maleName}在这住了几年，却在这熟悉的地方迷了路（捂脸），原本有点慌张的路程，因为你在身边，最后只剩下“迷路也很值得”的回忆。", focus: { x: 50, y: 34 }, ratio: "4 / 5" },
        { id: 8, time: "2026.02.01", title: "爱情公园", caption: "油菜花开得正好，本该偏冷的季节也变得温柔。风吹过来时，花海和你都在发光，让这一天像电影里的慢镜头。", focus: { x: 50, y: 36 }, ratio: "3 / 4" },
        { id: 9, time: "2026.02.13", title: "打平伙", caption: "这顿饭辣得很过瘾，连{maleName}这个江西人都服气。你最喜欢那里的蟹脚捞粉，看你吃得开心，{maleName}就想把这家店列进我们的长期清单。", focus: { x: 50, y: 37 }, ratio: "4 / 5" },
        { id: 10, time: "2026.02.14", title: "第一个情人节", caption: "我们的第一个情人节，本来只是普通的一天，但因为有{femaleName}，平凡也会发光。一起摘草莓、一起说笑，空气里都像带着甜味。", focus: { x: 50, y: 40 }, ratio: "3 / 4" },
        { id: 11, time: "2026.02.15", title: "景德镇陶瓷之旅", caption: "这趟景德镇之旅太有记忆点了：一起吃了地道的景德镇菜，你还亲手做了玻璃作品。后来逛到陶瓷村，街巷里几乎全是卖陶瓷的店，像闯进了一个只属于器物和烟火气的小世界。", focus: { x: 50, y: 34 }, ratio: "4 / 3" },
        { id: 12, time: "2026.02.19", title: "初见郑州", caption: "第一次去你家，路上一直给自己做心理建设，进门见到叔叔阿姨还是紧张。好在一切都很顺利，感谢你们的热情招待；夜里逛夜市，白天看城市地标，这趟郑州之行让“家”的感觉更近了一步。", focus: { x: 50, y: 33 }, ratio: "4 / 5" }
      ],

      // 场景脚本文案
      scriptData: {
        opening: [
          "{femaleName}，遇见你之前，我从没想过心会被一个人安稳地装满。",
          "你出现以后，{maleName}学会了把将来当成一件值得期待的事。",
          "那些普通的清晨和夜晚，因为有你，都变得温柔而明亮。",
          "谢谢你接住我的笨拙，也一直给我勇气。",
          "我想牵着你，认真走过平凡，也走过盛大。",
          "如果可以，往后的每一天，我都想在你身边。"
        ],
        fireworks: {
          countdown: ["3", "2", "1"],
          stagedLines: [
            "今晚的星空很亮，但不及你看向我的眼睛。",
            "每一次烟花升空，都是我想对你说的一句喜欢。",
            "我把最真诚的心意，放进这一场为你而来的光。"
          ],
          // 高潮阶段的主文案（原来写死在逻辑中）
          climaxWord: "{femaleName} 我爱你",
          composeWords: ["{femaleName} 我爱你", "你愿意吗"],
          holdMs: 15000
        },
        proposal: {
          vows: [
            "我曾以为，未来只是一个很远的词。",
            "直到遇见你，它第一次有了方向。",
            "如果你愿意，我想把余生写成我们。"
          ],
          subline: "这一刻，所有喧闹都退场，只剩我们。",
          cta: "我愿意",
          stageReadyAnnouncement: "誓言已完成，你可以确认承诺。",
          successAnnouncement: "誓约已确认，余生誓约正式生效。",
          certificateTitle: "余生誓约",
          certificateLines: [
            "从这一刻起，我们自愿结成彼此的唯一同行者。",
            "无论晴雨，彼此扶持；无论远近，彼此挂念。",
            "把每一个平凡明天，认真过成共同的以后。"
          ],
          signerA: "立约人：{maleName}",
          signerB: "立约人：{femaleName}",
          dateLabel: "立约日期：____年__月__日",
          epilogue: "爱你，从今天开始，永远有效。",
          memoryKeywords: ["第一次见面", "第一次认真聊天", "第一次约会", "和好拥抱", "平凡的一天"]
        }
      },

      // UI 文案（含状态提示）
      ui: {
        loadingTitle: "正在装载我们的回忆宇宙...",
        loadingButtonInit: "加载中...",
        loadingProgressPrefix: "爱心充能中 ",
        loadingCompleteButton: "进入宇宙",
        loadingCompleteStatus: "加载完成，请进入宇宙。",
        loadingErrorTemplate: "资源校验中发现 {count} 个异常，已启用占位图",

        albumHint: "左右拖拽浏览照片墙，点击查看细节",
        albumProgressTemplate: "回忆档案已点亮 {viewed}/{total}",
        albumProgressUnlockedSuffix: " · 烟花加强版已解锁",

        modeFreeSymbol: "自",
        modeAutoSymbol: "动",
        modeFreeTitle: "自由浏览",
        modeAutoTitle: "自动演示",

        audioSymbolOn: "♫",
        audioSymbolOff: "♪",
        audioTitleOn: "音乐已开启",
        audioTitleOff: "音乐已关闭",

        openingProgressTemplate: "第 {current} 句 / {total}",
        openingDoneSubline: "你出现以后，世界都亮了",

        proposalIntroAnnouncement: "求婚开场，誓言即将开始。",
        proposalFirstAnnouncement: "第一句誓言。",
        proposalSecondAnnouncement: "第二句誓言。",
        proposalThirdAnnouncement: "第三句誓言。"
      }
    },

    assets: {
      // 相册图片路径模板（单图模式）：{n} 会替换为两位编号（01, 02...）
      albumImagePattern: "src/assets/images/1/{n}.jpg",
      audio: {
        bgm: "src/music/bg1.mp3",
        firework: ["src/music/fire1.ogg", "src/music/fire2.ogg", "src/music/fire3.ogg", "src/music/fire4.ogg"],
        launch: ["src/music/fire1.ogg", "src/music/fire2.ogg", "src/music/fire3.ogg", "src/music/fire4.ogg"]
      }
    },

    flags: {
      // 自动模式下是否锁定在求婚场景
      lockProposalScene: true,
      // 点击进入后是否自动尝试开启音频
      autoEnableAudioOnEnter: true
    },

    timing: {
      opening: {
        typeCharMs: 190,
        linePauseMs: 2000
      },
      autoRhythm: {
        opening: { dwellMs: 42000 },
        album: { dwellMs: 75000, activeDwellMs: 90000 },
        fireworks: { dwellMs: 32000, postClimaxHoldMs: 6000 },
        proposal: { dwellMs: 60000 }
      },
      proposalRhythm: {
        introMs: 2000,
        revealMs: 420,
        holdMs: 2600,
        transitionMs: 180,
        warmDelayMs: 360,
        signerDelayMs: 360,
        signerGapMs: 240
      },
      fireworksTextMinDwellMs: 1200,
      fireworksClimaxDurationMs: 3400,
      fireworksClimaxIntervalMs: 260,
      fireworksAmbientTickMs: 160,
      proposalMemoryTraceLifeMs: 1550,
      proposalMemoryAmbientMs: 1800,
      proposalMemoryAmbientReducedMs: 2400,
      focusAutoCloseInactiveMs: 60000,
      albumActiveActionMs: 30000,
      autoModeTickMs: 1000,
      preloadImageTimeoutMs: 8000,
      preloadAudioTimeoutMs: 10000
    },

    thresholds: {
      audio: {
        maxBurstPlayers: 4,
        burstMinGapMs: 70,
        maxLaunchPlayers: 2,
        launchMinGapMs: 120,
        bgmVolume: 0.34
      },
      effect: {
        maxParticles: 4200,
        maxRockets: 22,
        maxTextParticles: 1800
      },
        fireworksCinematic: {
          clarity: {
            sizeScale: 0.9,
            gravityScale: 0.82,
            glowOuterAlpha: 0.03,
            trailAlphaScale: 0.45,
            trailWidthScale: 0.82,
            coreRatio: 0.48,
            rocketSizeScale: 0.72,
            rocketGlowAlpha: 0.02,
            rocketCoreAlpha: 0.78
          },
        heightBands: {
          build: { minRatio: 0.1, maxRatio: 0.22 },
          climax: { minRatio: 0.07, maxRatio: 0.24 },
          tail: { minRatio: 0.1, maxRatio: 0.2 },
          normal: { minRatio: 0.1, maxRatio: 0.22 }
        },
        colorStrategy: {
          pureWeight: {
            build: 0.6,
            climax: 0.8,
            tail: 0.65,
            normal: 0.7
          },
          pureHueJitter: 4,
          accentHueJitter: 17,
          purePalette: [352, 54, 284],
          accentPalette: [18, 28, 36, 44, 338, 346, 352]
        },
          pureAmplification: {
            explodeCountScale: 1.12,
            speedScale: 1.2,
            intensityScale: 1.08
          },
          engine: {
            trailFadeAlpha: 0.042,
            trailSegments: 6,
            particleFadeMin: 0.0024,
            particleFadeMax: 0.0072,
            particleShrinkMin: 0.946,
            particleShrinkMax: 0.986
          },
          textStyle: {
            fontFamily: "\"STKaiti\", \"KaiTi\", \"Kaiti SC\", \"Songti SC\", \"Noto Serif SC\", serif",
            fontWeight: "600",
            strokeColor: "rgba(40, 28, 20, 0.64)",
            lineWidthScale: 0.052,
            lineGapScale: 1.14
          },
          textProfiles: {
            countdown: {
              color: "#f4f8ff",
              colorAB: { whiteGold: "#f4f8ff", white: "#ffffff" },
              useABWhite: false,
              sampleStep: 2,
              pixelSize: 3.0,
              jitterMax: 0.1,
              reduced: { sampleStep: 2, pixelSize: 3.2, jitterMax: 0.08 }
            },
            staged: {
              color: "#f4f8ff",
              colorAB: { whiteGold: "#f4f8ff", white: "#ffffff" },
              useABWhite: false,
              sampleStep: 2,
              pixelSize: 2.1,
              jitterMax: 0.08,
              reduced: { sampleStep: 2, pixelSize: 2.4, jitterMax: 0.06 }
            },
            climax: {
              color: "#f4f8ff",
              colorAB: { whiteGold: "#f4f8ff", white: "#ffffff" },
              useABWhite: false,
              sampleStep: 2,
              pixelSize: 2.2,
              jitterMax: 0.08,
              reduced: { sampleStep: 2, pixelSize: 2.5, jitterMax: 0.06 }
            },
            compose: {
              color: "#f4f8ff",
              colorAB: { whiteGold: "#f4f8ff", white: "#ffffff" },
              useABWhite: false,
              sampleStep: 2,
              pixelSize: 2.0,
              jitterMax: 0.08,
              reduced: { sampleStep: 2, pixelSize: 2.4, jitterMax: 0.06 }
            }
          },
          peakGuardrails: {
            climaxTimerBurstMin: 100,
            climaxTimerBurstMax: 150,
            massBurstWaves: 4,
            massBurstWaveIntervalMs: 180,
            massBurstCountMin: 120,
            massBurstCountMax: 170,
            reducedMassBurstWaves: 4,
            reducedMassBurstCountMin: 90,
            reducedMassBurstCountMax: 120
          }
        },
      fireworksStageProfiles: {
        build: { chance: 0.72, intervalMs: 920, burstMin: 120, burstMax: 170, vxSpread: 2.4, vyMin: 5.8, vyMax: 8.8 },
        climax: { chance: 0.82, intervalMs: 240, burstMin: 130, burstMax: 180, vxSpread: 2.8, vyMin: 6.0, vyMax: 8.8 },
        tail: { chance: 0.55, intervalMs: 700, burstMin: 96, burstMax: 140, vxSpread: 2.1, vyMin: 5.2, vyMax: 7.8 },
        normal: { chance: 0.68, intervalMs: 920, burstMin: 120, burstMax: 170, vxSpread: 2.3, vyMin: 5.6, vyMax: 8.4 }
      }
    }
  };
})();
