/**
 * Verse source list — the editorial layer.
 *
 * `text` is the plaque excerpt (what actually gets engraved). It is written in
 * KJV wording and is checked, character for character, against the real KJV by
 * tools/build-verses.mjs. Nothing here is trusted on memory: the build step
 * fails loudly if an excerpt is not a verbatim span of the source verse.
 *
 * `word` is the subject word for the badge. `alts` are other good subject words
 * for the same verse — the editor offers them as one-click swaps.
 *
 *   ref    "Book C:V" or "Book C:V-V" (must resolve in both KJV and WEB)
 *   text   plaque excerpt, KJV wording, no trailing punctuation
 *   word   default badge word
 *   alts   alternative badge words
 *   tags   free-form search keywords
 *   set    product collection id (see assets/js/presets.js)
 */

export default [
  // ── The Household Collection ───────────────────────────────────────────────
  { ref: 'Luke 10:5', text: 'Peace be to this house', word: 'PEACE', alts: ['HOME', 'HOUSE', 'BLESSING'], tags: ['home', 'peace', 'housewarming', 'welcome'], set: 'household' },
  { ref: 'Joshua 24:15', text: 'As for me and my house, we will serve the LORD', word: 'HOUSEHOLD', alts: ['SERVE', 'CHOSEN', 'OUR HOUSE'], tags: ['home', 'family', 'commitment', 'housewarming'], set: 'household' },
  { ref: 'Psalm 127:1', text: 'Except the LORD build the house, they labour in vain that build it', word: 'FOUNDATION', alts: ['BUILT', 'BUILDER'], tags: ['home', 'foundation', 'building'], set: 'household' },
  { ref: 'Proverbs 24:3', text: 'Through wisdom is an house builded', word: 'WISDOM', alts: ['BUILT', 'HOME'], tags: ['home', 'wisdom'], set: 'household' },
  { ref: 'Proverbs 3:33', text: 'He blesseth the habitation of the just', word: 'BLESSED', alts: ['BLESSING', 'HOME'], tags: ['home', 'blessing'], set: 'household' },
  { ref: 'Acts 16:31', text: 'Believe on the Lord Jesus Christ, and thou shalt be saved, and thy house', word: 'BELIEVE', alts: ['SAVED', 'HOUSEHOLD'], tags: ['home', 'salvation', 'family'], set: 'household' },
  { ref: 'Psalm 121:8', text: 'The LORD shall preserve thy going out and thy coming in', word: 'WATCHED', alts: ['KEEPER', 'GUARDED', 'COMING IN'], tags: ['home', 'entry', 'protection', 'doorway'], set: 'household' },
  { ref: 'Isaiah 32:18', text: 'My people shall dwell in a peaceable habitation', word: 'DWELL', alts: ['PEACEABLE', 'REST'], tags: ['home', 'peace', 'dwelling'], set: 'household' },
  { ref: 'Psalm 101:2', text: 'I will walk within my house with a perfect heart', word: 'INTEGRITY', alts: ['UPRIGHT', 'HOME'], tags: ['home', 'integrity', 'character'], set: 'household' },
  { ref: 'Psalm 26:8', text: 'LORD, I have loved the habitation of thy house', word: 'HOME', alts: ['DWELLING', 'LOVED'], tags: ['home', 'love', 'sanctuary'], set: 'household' },
  { ref: 'Ephesians 2:19', text: 'Fellowcitizens with the saints, and of the household of God', word: 'HOUSEHOLD', alts: ['BELONGING', 'FAMILY'], tags: ['home', 'belonging', 'church'], set: 'household' },
  { ref: 'Hebrews 3:4', text: 'He that built all things is God', word: 'BUILDER', alts: ['MAKER', 'BUILT'], tags: ['home', 'creation', 'building'], set: 'household' },
  { ref: 'Proverbs 17:1', text: 'Better is a dry morsel, and quietness therewith', word: 'QUIET', alts: ['CONTENTMENT', 'PEACE'], tags: ['home', 'contentment', 'quiet'], set: 'household' },
  { ref: '2 Samuel 7:29', text: 'Let it please thee to bless the house of thy servant', word: 'BLESS', alts: ['BLESSING', 'THIS HOUSE'], tags: ['home', 'blessing', 'prayer'], set: 'household' },
  { ref: 'Deuteronomy 6:9', text: 'Thou shalt write them upon the posts of thy house, and on thy gates', word: 'WRITTEN', alts: ['REMEMBER', 'ON OUR GATES'], tags: ['home', 'doorpost', 'remembrance'], set: 'household' },

  // ── Peace ──────────────────────────────────────────────────────────────────
  { ref: 'John 14:27', text: 'Peace I leave with you, my peace I give unto you', word: 'PEACE', alts: ['GIVEN', 'HIS PEACE'], tags: ['peace', 'comfort'], set: 'household' },
  { ref: 'Philippians 4:7', text: 'The peace of God, which passeth all understanding', word: 'PEACE', alts: ['UNDERSTANDING', 'GUARDED'], tags: ['peace', 'anxiety', 'comfort'], set: 'grace' },
  { ref: 'Isaiah 26:3', text: 'Thou wilt keep him in perfect peace, whose mind is stayed on thee', word: 'PERFECT PEACE', alts: ['STAYED', 'PEACE'], tags: ['peace', 'trust', 'anxiety'], set: 'grace' },
  { ref: 'Psalm 4:8', text: 'I will both lay me down in peace, and sleep', word: 'REST', alts: ['PEACE', 'SLEEP', 'SAFE'], tags: ['peace', 'bedroom', 'rest', 'sleep'], set: 'household' },
  { ref: 'Numbers 6:26', text: 'The LORD lift up his countenance upon thee, and give thee peace', word: 'PEACE', alts: ['BLESSING', 'FAVOR'], tags: ['peace', 'blessing', 'benediction'], set: 'household' },
  { ref: 'Matthew 5:9', text: 'Blessed are the peacemakers', word: 'PEACEMAKER', alts: ['BLESSED', 'PEACE'], tags: ['peace', 'beatitude'], set: 'cornerstone' },
  { ref: 'Colossians 3:15', text: 'Let the peace of God rule in your hearts', word: 'PEACE', alts: ['RULE', 'HEART'], tags: ['peace', 'heart'], set: 'household' },
  { ref: 'Mark 4:39', text: 'Peace, be still', word: 'BE STILL', alts: ['PEACE', 'STILL'], tags: ['peace', 'storm', 'calm', 'anxiety'], set: 'grace' },
  { ref: 'Psalm 29:11', text: 'The LORD will bless his people with peace', word: 'PEACE', alts: ['BLESSED', 'STRENGTH'], tags: ['peace', 'blessing'], set: 'household' },
  { ref: 'Isaiah 9:6', text: 'The Prince of Peace', word: 'PRINCE OF PEACE', alts: ['WONDERFUL', 'COUNSELLOR', 'PEACE'], tags: ['peace', 'christmas', 'advent', 'names of god'], set: 'grace' },
  { ref: '2 Thessalonians 3:16', text: 'The Lord of peace himself give you peace always', web: 'the Lord of peace himself give you peace at all times', word: 'ALWAYS', alts: ['PEACE', 'LORD OF PEACE'], tags: ['peace', 'benediction'], set: 'grace' },
  { ref: 'Romans 12:18', text: 'Live peaceably with all men', word: 'PEACEABLE', alts: ['PEACE', 'WITH ALL'], tags: ['peace', 'relationships'], set: 'cornerstone' },

  // ── Faith ──────────────────────────────────────────────────────────────────
  { ref: 'Hebrews 11:1', text: 'Faith is the substance of things hoped for, the evidence of things not seen', word: 'FAITH', alts: ['SUBSTANCE', 'UNSEEN'], tags: ['faith', 'hope'], set: 'pilgrim' },
  { ref: '2 Corinthians 5:7', text: 'We walk by faith, not by sight', word: 'FAITH', alts: ['WALK', 'NOT BY SIGHT'], tags: ['faith', 'trust', 'journey'], set: 'pilgrim' },
  { ref: 'Matthew 17:20', text: 'If ye have faith as a grain of mustard seed', word: 'MUSTARD SEED', alts: ['FAITH', 'NOTHING IMPOSSIBLE'], tags: ['faith', 'small beginnings'], set: 'pilgrim' },
  { ref: 'Mark 9:23', text: 'All things are possible to him that believeth', word: 'BELIEVE', alts: ['POSSIBLE', 'ALL THINGS'], tags: ['faith', 'possibility'], set: 'pilgrim' },
  { ref: 'Ephesians 2:8', text: 'For by grace are ye saved through faith', word: 'GRACE', alts: ['SAVED', 'FAITH', 'THE GIFT'], tags: ['faith', 'grace', 'salvation'], set: 'grace' },
  { ref: 'Hebrews 12:2', text: 'Looking unto Jesus the author and finisher of our faith', word: 'AUTHOR', alts: ['FINISHER', 'FAITH', 'LOOKING UNTO'], tags: ['faith', 'perseverance'], set: 'pilgrim' },
  { ref: '1 Corinthians 16:13', text: 'Stand fast in the faith, quit you like men, be strong', word: 'STAND FAST', alts: ['BE STRONG', 'WATCH', 'STAND'], tags: ['faith', 'courage', 'strength'], set: 'sentinel' },
  { ref: 'Romans 10:17', text: 'Faith cometh by hearing, and hearing by the word of God', word: 'FAITH', alts: ['HEARING', 'THE WORD'], tags: ['faith', 'scripture'], set: 'pilgrim' },
  { ref: '2 Timothy 4:7', text: 'I have fought a good fight, I have finished my course, I have kept the faith', word: 'KEPT THE FAITH', alts: ['FINISHED', 'THE GOOD FIGHT'], tags: ['faith', 'legacy', 'memorial', 'retirement'], set: 'grace' },
  { ref: 'James 1:6', text: 'Let him ask in faith, nothing wavering', word: 'UNWAVERING', alts: ['ASK', 'FAITH'], tags: ['faith', 'prayer'], set: 'pilgrim' },

  // ── Hope ───────────────────────────────────────────────────────────────────
  { ref: 'Jeremiah 29:11', text: 'I know the thoughts that I think toward you', word: 'HOPE', alts: ['A FUTURE', 'HIS PLANS', 'KNOWN'], tags: ['hope', 'future', 'graduation'], set: 'pilgrim' },
  { ref: 'Romans 15:13', text: 'Now the God of hope fill you with all joy and peace in believing', word: 'HOPE', alts: ['JOY', 'FILLED'], tags: ['hope', 'joy', 'peace'], set: 'pilgrim' },
  { ref: 'Isaiah 40:31', text: 'They that wait upon the LORD shall renew their strength', word: 'RENEW', alts: ['WINGS', 'WAIT', 'STRENGTH'], tags: ['hope', 'strength', 'endurance'], set: 'sentinel' },
  { ref: 'Lamentations 3:23', text: 'They are new every morning: great is thy faithfulness', word: 'FAITHFULNESS', alts: ['NEW MERCIES', 'EVERY MORNING'], tags: ['hope', 'mercy', 'morning', 'new beginnings'], set: 'grace' },
  { ref: 'Hebrews 6:19', text: 'Which hope we have as an anchor of the soul, both sure and stedfast', word: 'ANCHOR', alts: ['STEDFAST', 'HOPE', 'SURE'], tags: ['hope', 'anchor', 'nautical', 'steadfast'], set: 'sentinel' },
  { ref: 'Psalm 42:11', text: 'Hope thou in God', word: 'HOPE', alts: ['IN GOD', 'MY HOPE'], tags: ['hope', 'depression', 'comfort'], set: 'grace' },
  { ref: 'Romans 8:28', text: 'All things work together for good to them that love God', web: 'all things work together for good for those who love God', word: 'PURPOSE', alts: ['ALL THINGS', 'FOR GOOD'], tags: ['hope', 'purpose', 'providence'], set: 'pilgrim' },
  { ref: 'Titus 2:13', text: 'Looking for that blessed hope', word: 'BLESSED HOPE', alts: ['LOOKING', 'HOPE'], tags: ['hope', 'advent'], set: 'pilgrim' },
  { ref: 'Proverbs 23:18', text: 'Thine expectation shall not be cut off', word: 'EXPECTATION', alts: ['HOPE', 'AN END'], tags: ['hope', 'perseverance'], set: 'pilgrim' },

  // ── Love & the Covenant Collection ─────────────────────────────────────────
  { ref: '1 Corinthians 13:8', text: 'Charity never faileth', word: 'LOVE', alts: ['NEVER FAILS', 'CHARITY'], tags: ['love', 'wedding', 'anniversary'], set: 'covenant' },
  { ref: '1 Corinthians 13:13', text: 'And now abideth faith, hope, charity, these three', word: 'THESE THREE', alts: ['LOVE', 'FAITH HOPE LOVE', 'ABIDE'], tags: ['love', 'faith', 'hope', 'wedding'], set: 'covenant' },
  { ref: '1 John 4:19', text: 'We love him, because he first loved us', word: 'FIRST LOVED', alts: ['LOVE', 'BECAUSE'], tags: ['love', 'grace'], set: 'covenant' },
  { ref: '1 John 4:8', text: 'God is love', word: 'LOVE', alts: ['GOD IS LOVE'], tags: ['love'], set: 'covenant' },
  { ref: 'John 15:13', text: 'Greater love hath no man than this', web: 'Greater love has no one than this', word: 'GREATER LOVE', alts: ['SACRIFICE', 'LOVE'], tags: ['love', 'sacrifice', 'memorial', 'military', 'first responder'], set: 'sentinel' },
  { ref: 'Song of Solomon 6:3', text: 'I am my beloved’s, and my beloved is mine', word: 'BELOVED', alts: ['MINE', 'COVENANT'], tags: ['love', 'wedding', 'anniversary', 'marriage'], set: 'covenant' },
  { ref: 'Song of Solomon 8:7', text: 'Many waters cannot quench love', word: 'UNQUENCHED', alts: ['LOVE', 'MANY WATERS'], tags: ['love', 'wedding', 'endurance'], set: 'covenant' },
  { ref: 'Colossians 3:14', text: 'And above all these things put on charity, which is the bond of perfectness', word: 'THE BOND', alts: ['LOVE', 'ABOVE ALL'], tags: ['love', 'unity', 'wedding'], set: 'covenant' },
  { ref: '1 Peter 4:8', text: 'Have fervent charity among yourselves', web: 'be earnest in your love among yourselves', word: 'FERVENT', alts: ['LOVE', 'ONE ANOTHER'], tags: ['love', 'community'], set: 'covenant' },
  { ref: 'Proverbs 10:12', text: 'Love covereth all sins', word: 'COVERED', alts: ['LOVE', 'MERCY'], tags: ['love', 'forgiveness'], set: 'covenant' },
  { ref: '1 John 4:18', text: 'Perfect love casteth out fear', word: 'NO FEAR', alts: ['PERFECT LOVE', 'LOVE'], tags: ['love', 'fear', 'courage'], set: 'sentinel' },
  { ref: 'Romans 12:10', text: 'Be kindly affectioned one to another with brotherly love', word: 'KINDNESS', alts: ['BROTHERLY LOVE', 'ONE ANOTHER'], tags: ['love', 'kindness', 'community'], set: 'covenant' },
  { ref: 'Ephesians 5:25', text: 'Husbands, love your wives', word: 'DEVOTION', alts: ['LOVE HER', 'CHERISH'], tags: ['love', 'marriage', 'wedding'], set: 'covenant' },
  { ref: 'Matthew 19:6', text: 'What therefore God hath joined together, let not man put asunder', word: 'JOINED', alts: ['ONE', 'COVENANT', 'TOGETHER'], tags: ['wedding', 'marriage', 'covenant'], set: 'covenant' },
  { ref: 'Ecclesiastes 4:12', text: 'A threefold cord is not quickly broken', word: 'THREEFOLD', alts: ['UNBROKEN', 'CORD OF THREE'], tags: ['wedding', 'marriage', 'unity'], set: 'covenant' },
  { ref: 'Ecclesiastes 4:9', text: 'Two are better than one', word: 'TWO', alts: ['BETTER TOGETHER', 'TOGETHER'], tags: ['wedding', 'marriage', 'friendship'], set: 'covenant' },
  { ref: 'Genesis 2:24', text: 'And they shall be one flesh', word: 'ONE', alts: ['UNITED', 'ONE FLESH'], tags: ['wedding', 'marriage'], set: 'covenant' },
  { ref: 'Ruth 1:16', text: 'Whither thou goest, I will go', word: 'WHEREVER', alts: ['DEVOTION', 'I WILL GO'], tags: ['wedding', 'marriage', 'loyalty', 'friendship'], set: 'covenant' },
  { ref: 'Proverbs 18:22', text: 'Whoso findeth a wife findeth a good thing', word: 'FOUND', alts: ['A GOOD THING', 'FAVOUR'], tags: ['wedding', 'marriage'], set: 'covenant' },
  { ref: 'Song of Solomon 3:4', text: 'I found him whom my soul loveth', word: 'FOUND', alts: ['MY SOUL LOVES', 'BELOVED'], tags: ['wedding', 'marriage', 'love'], set: 'covenant' },
  { ref: '1 Corinthians 13:7', text: 'Beareth all things, believeth all things, hopeth all things, endureth all things', word: 'ENDURES', alts: ['ALL THINGS', 'LOVE'], tags: ['wedding', 'love', 'endurance'], set: 'covenant' },

  // ── The Sentinel Collection: strength, courage, protection ─────────────────
  { ref: 'Joshua 1:9', text: 'Be strong and of a good courage; be not afraid', web: "Be strong and courageous. Don't be afraid", word: 'COURAGE', alts: ['BE STRONG', 'FEAR NOT', 'STRONG'], tags: ['courage', 'strength', 'military', 'graduation'], set: 'sentinel' },
  { ref: 'Philippians 4:13', text: 'I can do all things through Christ which strengtheneth me', word: 'STRENGTH', alts: ['ALL THINGS', 'THROUGH HIM'], tags: ['strength', 'sport', 'perseverance'], set: 'sentinel' },
  { ref: 'Isaiah 41:10', text: 'Fear thou not; for I am with thee', web: "Don't you be afraid, for I am with you", word: 'FEAR NOT', alts: ['WITH THEE', 'UPHELD'], tags: ['courage', 'fear', 'comfort'], set: 'sentinel' },
  { ref: 'Deuteronomy 31:6', text: 'Be strong and of a good courage, fear not', web: "Be strong and courageous. Don't be afraid", word: 'STRONG', alts: ['COURAGE', 'HE GOES WITH YOU'], tags: ['courage', 'strength'], set: 'sentinel' },
  { ref: 'Psalm 46:1', text: 'God is our refuge and strength, a very present help in trouble', word: 'REFUGE', alts: ['STRENGTH', 'PRESENT HELP'], tags: ['refuge', 'strength', 'trouble'], set: 'sentinel' },
  { ref: 'Ephesians 6:10', text: 'Be strong in the Lord, and in the power of his might', web: 'be strong in the Lord, and in the strength of his might', word: 'ARMOR', alts: ['STRONG', 'HIS MIGHT', 'STAND'], tags: ['strength', 'spiritual warfare', 'military'], set: 'sentinel' },
  { ref: 'Psalm 27:1', text: 'The LORD is my light and my salvation; whom shall I fear?', word: 'FEARLESS', alts: ['MY LIGHT', 'WHOM SHALL I FEAR'], tags: ['courage', 'light', 'fear'], set: 'sentinel' },
  { ref: '2 Timothy 1:7', text: 'God hath not given us the spirit of fear; but of power, and of love, and of a sound mind', word: 'POWER', alts: ['SOUND MIND', 'NOT FEAR'], tags: ['courage', 'fear', 'anxiety'], set: 'sentinel' },
  { ref: 'Nehemiah 8:10', text: 'The joy of the LORD is your strength', word: 'JOY', alts: ['STRENGTH', 'HIS JOY'], tags: ['joy', 'strength'], set: 'sentinel' },
  { ref: 'Psalm 18:2', text: 'The LORD is my rock, and my fortress, and my deliverer', word: 'FORTRESS', alts: ['MY ROCK', 'DELIVERER'], tags: ['refuge', 'strength', 'protection'], set: 'sentinel' },
  { ref: 'Isaiah 40:29', text: 'He giveth power to the faint', word: 'POWER', alts: ['STRENGTH', 'TO THE FAINT'], tags: ['strength', 'weariness'], set: 'sentinel' },
  { ref: '1 Chronicles 16:11', text: 'Seek the LORD and his strength, seek his face continually', word: 'SEEK', alts: ['HIS STRENGTH', 'CONTINUALLY'], tags: ['strength', 'seeking', 'prayer'], set: 'pilgrim' },
  { ref: 'Psalm 31:24', text: 'Be of good courage, and he shall strengthen your heart', word: 'COURAGE', alts: ['STRENGTHENED', 'TAKE HEART'], tags: ['courage', 'heart'], set: 'sentinel' },
  { ref: 'Habakkuk 3:19', text: 'The LORD God is my strength', word: 'STRENGTH', alts: ['HINDS FEET', 'HIGH PLACES'], tags: ['strength', 'mountains', 'hiking'], set: 'sentinel' },
  { ref: 'Exodus 14:14', text: 'The LORD shall fight for you, and ye shall hold your peace', word: 'HE FIGHTS', alts: ['HOLD YOUR PEACE', 'STAND STILL'], tags: ['courage', 'battle', 'trust'], set: 'sentinel' },
  { ref: 'Psalm 91:1', text: 'He that dwelleth in the secret place of the most High', word: 'SHELTER', alts: ['SECRET PLACE', 'ABIDE'], tags: ['protection', 'refuge', 'shelter'], set: 'sentinel' },
  { ref: 'Psalm 91:4', text: 'He shall cover thee with his feathers', word: 'COVERED', alts: ['HIS WINGS', 'SHIELD'], tags: ['protection', 'refuge', 'nursery'], set: 'sentinel' },
  { ref: 'Psalm 121:7', text: 'The LORD shall preserve thee from all evil', word: 'PRESERVED', alts: ['KEPT', 'FROM ALL EVIL'], tags: ['protection', 'travel', 'home'], set: 'sentinel' },
  { ref: 'Psalm 32:7', text: 'Thou art my hiding place', word: 'HIDING PLACE', alts: ['REFUGE', 'PRESERVED'], tags: ['protection', 'refuge', 'comfort'], set: 'grace' },
  { ref: 'Proverbs 18:10', text: 'The name of the LORD is a strong tower', web: "Yahweh's name is a strong tower", word: 'STRONG TOWER', alts: ['SAFE', 'THE NAME'], tags: ['protection', 'refuge', 'safety'], set: 'sentinel' },
  { ref: 'Isaiah 54:17', text: 'No weapon that is formed against thee shall prosper', word: 'NO WEAPON', alts: ['PROTECTED', 'SHALL PROSPER'], tags: ['protection', 'spiritual warfare'], set: 'sentinel' },
  { ref: '2 Thessalonians 3:3', text: 'The Lord is faithful, who shall stablish you, and keep you from evil', word: 'FAITHFUL', alts: ['ESTABLISHED', 'KEPT'], tags: ['protection', 'faithfulness'], set: 'sentinel' },
  { ref: 'Psalm 3:3', text: 'But thou, O LORD, art a shield for me', word: 'SHIELD', alts: ['MY GLORY', 'LIFTED'], tags: ['protection', 'refuge'], set: 'sentinel' },
  { ref: 'Nahum 1:7', text: 'The LORD is good, a strong hold in the day of trouble', word: 'STRONGHOLD', alts: ['HE IS GOOD', 'IN TROUBLE'], tags: ['protection', 'refuge', 'trouble'], set: 'sentinel' },

  // ── Trust & guidance: the Pilgrim Collection ───────────────────────────────
  { ref: 'Proverbs 3:5', text: 'Trust in the LORD with all thine heart', word: 'TRUST', alts: ['ALL YOUR HEART', 'LEAN NOT'], tags: ['trust', 'guidance'], set: 'pilgrim' },
  { ref: 'Proverbs 3:6', text: 'In all thy ways acknowledge him, and he shall direct thy paths', word: 'DIRECTED', alts: ['HIS PATHS', 'ALL YOUR WAYS'], tags: ['trust', 'guidance', 'direction'], set: 'pilgrim' },
  { ref: 'Psalm 119:105', text: 'Thy word is a lamp unto my feet, and a light unto my path', word: 'LAMP', alts: ['LIGHT', 'MY PATH'], tags: ['guidance', 'scripture', 'light'], set: 'pilgrim' },
  { ref: 'Psalm 23:1', text: 'The LORD is my shepherd; I shall not want', word: 'SHEPHERD', alts: ['I SHALL NOT WANT', 'PROVIDED'], tags: ['shepherd', 'provision', 'comfort'], set: 'grace' },
  { ref: 'Psalm 23:4', text: 'Yea, though I walk through the valley of the shadow of death, I will fear no evil', word: 'FEAR NO EVIL', alts: ['THE VALLEY', 'THOU ART WITH ME'], tags: ['comfort', 'grief', 'courage', 'memorial'], set: 'grace' },
  { ref: 'Isaiah 30:21', text: 'This is the way, walk ye in it', word: 'THE WAY', alts: ['WALK IN IT', 'GUIDED'], tags: ['guidance', 'direction'], set: 'pilgrim' },
  { ref: 'Psalm 32:8', text: 'I will instruct thee and teach thee in the way which thou shalt go', word: 'GUIDED', alts: ['TAUGHT', 'THE WAY'], tags: ['guidance', 'teaching'], set: 'pilgrim' },
  { ref: 'Jeremiah 6:16', text: 'Ask for the old paths, where is the good way, and walk therein', word: 'THE OLD PATHS', alts: ['THE GOOD WAY', 'REST'], tags: ['guidance', 'tradition', 'heritage'], set: 'pilgrim' },
  { ref: 'Psalm 37:5', text: 'Commit thy way unto the LORD; trust also in him', word: 'COMMIT', alts: ['TRUST', 'YOUR WAY'], tags: ['trust', 'surrender'], set: 'pilgrim' },
  { ref: 'Proverbs 16:9', text: 'A man’s heart deviseth his way: but the LORD directeth his steps', word: 'HIS STEPS', alts: ['DIRECTED', 'THE PLAN'], tags: ['guidance', 'providence'], set: 'pilgrim' },
  { ref: 'Psalm 25:4', text: 'Shew me thy ways, O LORD; teach me thy paths', word: 'SHOW ME', alts: ['TEACH ME', 'YOUR PATHS'], tags: ['guidance', 'prayer'], set: 'pilgrim' },
  { ref: 'Isaiah 43:2', text: 'When thou passest through the waters, I will be with thee', word: 'WITH THEE', alts: ['THROUGH THE WATERS', 'NOT ALONE'], tags: ['comfort', 'trial', 'courage'], set: 'grace' },
  { ref: 'Psalm 16:8', text: 'I have set the LORD always before me', word: 'ALWAYS', alts: ['UNMOVED', 'BEFORE ME'], tags: ['trust', 'steadfast'], set: 'pilgrim' },
  { ref: 'Psalm 56:3', text: 'What time I am afraid, I will trust in thee', word: 'I WILL TRUST', alts: ['TRUST', 'AFRAID'], tags: ['trust', 'fear', 'anxiety'], set: 'grace' },

  // ── Joy, gratitude, praise ─────────────────────────────────────────────────
  { ref: 'Psalm 118:24', text: 'This is the day which the LORD hath made; we will rejoice and be glad in it', word: 'REJOICE', alts: ['THIS DAY', 'BE GLAD'], tags: ['joy', 'gratitude', 'morning'], set: 'table' },
  { ref: 'Philippians 4:4', text: 'Rejoice in the Lord alway', word: 'REJOICE', alts: ['ALWAYS', 'JOY'], tags: ['joy'], set: 'table' },
  { ref: 'Psalm 100:4', text: 'Enter into his gates with thanksgiving, and into his courts with praise', web: 'Enter into his gates with thanksgiving, and into his courts with praise', word: 'THANKSGIVING', alts: ['PRAISE', 'ENTER IN'], tags: ['gratitude', 'thanksgiving', 'entry', 'welcome'], set: 'table' },
  { ref: '1 Thessalonians 5:18', text: 'In every thing give thanks', word: 'GIVE THANKS', alts: ['EVERYTHING', 'GRATEFUL'], tags: ['gratitude', 'thanksgiving'], set: 'table' },
  { ref: 'Psalm 107:1', text: 'O give thanks unto the LORD; for he is good', word: 'GRATEFUL', alts: ['HE IS GOOD', 'GIVE THANKS'], tags: ['gratitude', 'thanksgiving'], set: 'table' },
  { ref: 'Psalm 150:6', text: 'Let every thing that hath breath praise the LORD', word: 'PRAISE', alts: ['EVERY BREATH', 'HALLELUJAH'], tags: ['praise', 'worship', 'music'], set: 'table' },
  { ref: 'Psalm 34:1', text: 'I will bless the LORD at all times', word: 'AT ALL TIMES', alts: ['BLESS THE LORD', 'PRAISE'], tags: ['praise', 'gratitude'], set: 'table' },
  { ref: 'Colossians 3:17', text: 'Whatsoever ye do in word or deed, do all in the name of the Lord Jesus', word: 'ALL IN HIS NAME', alts: ['WORD AND DEED', 'WHATEVER YOU DO'], tags: ['work', 'purpose', 'gratitude'], set: 'cornerstone' },
  { ref: 'Psalm 95:1', text: 'O come, let us sing unto the LORD', web: "Oh come, let's sing to Yahweh", word: 'SING', alts: ['COME', 'JOYFUL NOISE'], tags: ['praise', 'worship', 'music'], set: 'table' },
  { ref: 'Psalm 16:11', text: 'In thy presence is fulness of joy', word: 'FULNESS OF JOY', alts: ['HIS PRESENCE', 'JOY'], tags: ['joy', 'presence'], set: 'table' },
  { ref: 'James 1:17', text: 'Every good gift and every perfect gift is from above', word: 'GOOD GIFT', alts: ['FROM ABOVE', 'EVERY GIFT'], tags: ['gratitude', 'gift', 'baby'], set: 'nursery' },

  // ── The Table Collection: kitchen, hospitality, gathering ──────────────────
  { ref: 'Psalm 34:8', text: 'O taste and see that the LORD is good', word: 'TASTE AND SEE', alts: ['HE IS GOOD', 'TASTE'], tags: ['kitchen', 'table', 'gratitude'], set: 'table' },
  { ref: 'Matthew 6:11', text: 'Give us this day our daily bread', word: 'DAILY BREAD', alts: ['PROVIDED', 'THIS DAY'], tags: ['kitchen', 'table', 'provision', 'prayer'], set: 'table' },
  { ref: 'Psalm 23:5', text: 'Thou preparest a table before me', word: 'THE TABLE', alts: ['PREPARED', 'MY CUP'], tags: ['table', 'dining', 'provision'], set: 'table' },
  { ref: 'Hebrews 13:2', text: 'Be not forgetful to entertain strangers', word: 'WELCOME', alts: ['ANGELS UNAWARES', 'HOSPITALITY'], tags: ['hospitality', 'welcome', 'entry', 'guest room'], set: 'table' },
  { ref: '1 Timothy 4:4', text: 'Every creature of God is good, and nothing to be refused', word: 'RECEIVED', alts: ['ALL IS GOOD', 'THANKSGIVING'], tags: ['kitchen', 'table', 'gratitude'], set: 'table' },
  { ref: 'Acts 2:46', text: 'With gladness and singleness of heart', word: 'GLADNESS', alts: ['BREAKING BREAD', 'TOGETHER'], tags: ['table', 'community', 'fellowship'], set: 'table' },
  { ref: 'Romans 12:13', text: 'Given to hospitality', word: 'HOSPITALITY', alts: ['GIVEN TO', 'WELCOME'], tags: ['hospitality', 'welcome'], set: 'table' },
  { ref: 'John 6:35', text: 'I am the bread of life', word: 'BREAD OF LIFE', alts: ['THE BREAD', 'NEVER HUNGER'], tags: ['kitchen', 'table', 'communion'], set: 'table' },
  { ref: 'Proverbs 15:17', text: 'Better is a dinner of herbs where love is', word: 'WHERE LOVE IS', alts: ['LOVE', 'THE TABLE'], tags: ['table', 'dining', 'love', 'contentment'], set: 'table' },
  { ref: '1 Peter 4:9', text: 'Use hospitality one to another without grudging', word: 'HOSPITALITY', alts: ['ONE ANOTHER', 'WELCOME'], tags: ['hospitality', 'welcome'], set: 'table' },
  { ref: 'Deuteronomy 8:10', text: 'When thou hast eaten and art full, then thou shalt bless the LORD', web: 'You shall eat and be full, and you shall bless Yahweh', word: 'BLESS THE LORD', alts: ['SATISFIED', 'GIVE THANKS'], tags: ['kitchen', 'table', 'gratitude', 'grace before meals'], set: 'table' },

  // ── Comfort, grief, memorial: the Grace Collection ─────────────────────────
  { ref: 'Psalm 34:18', text: 'The LORD is nigh unto them that are of a broken heart', word: 'NEAR', alts: ['BROKEN HEARTED', 'HE IS NIGH'], tags: ['grief', 'comfort', 'sympathy'], set: 'grace' },
  { ref: 'Matthew 5:4', text: 'Blessed are they that mourn: for they shall be comforted', word: 'COMFORTED', alts: ['BLESSED', 'THEY THAT MOURN'], tags: ['grief', 'comfort', 'sympathy', 'funeral'], set: 'grace' },
  { ref: 'Revelation 21:4', text: 'God shall wipe away all tears from their eyes', web: 'He will wipe away every tear from their eyes', word: 'NO MORE TEARS', alts: ['WIPED AWAY', 'ALL THINGS NEW'], tags: ['grief', 'memorial', 'hope', 'funeral'], set: 'grace' },
  { ref: 'John 11:25', text: 'I am the resurrection, and the life', word: 'RESURRECTION', alts: ['THE LIFE', 'EASTER'], tags: ['memorial', 'easter', 'hope', 'funeral'], set: 'grace' },
  { ref: 'Psalm 147:3', text: 'He healeth the broken in heart, and bindeth up their wounds', word: 'HEALED', alts: ['BOUND UP', 'BROKEN HEARTS'], tags: ['grief', 'healing', 'comfort'], set: 'grace' },
  { ref: '2 Corinthians 1:3', text: 'The Father of mercies, and the God of all comfort', word: 'ALL COMFORT', alts: ['MERCIES', 'COMFORT'], tags: ['grief', 'comfort', 'sympathy'], set: 'grace' },
  { ref: 'Psalm 116:15', text: 'Precious in the sight of the LORD is the death of his saints', word: 'PRECIOUS', alts: ['HIS SAINTS', 'REMEMBERED'], tags: ['memorial', 'funeral', 'grief'], set: 'grace' },
  { ref: 'Isaiah 41:13', text: 'Fear not; I will help thee', word: 'FEAR NOT', alts: ['I WILL HELP', 'HELD'], tags: ['comfort', 'fear', 'courage'], set: 'grace' },
  { ref: 'Matthew 11:28', text: 'Come unto me, all ye that labour and are heavy laden, and I will give you rest', word: 'REST', alts: ['COME TO ME', 'HEAVY LADEN'], tags: ['rest', 'comfort', 'weariness'], set: 'grace' },
  { ref: 'Deuteronomy 33:27', text: 'The eternal God is thy refuge, and underneath are the everlasting arms', word: 'EVERLASTING ARMS', alts: ['REFUGE', 'UNDERNEATH'], tags: ['comfort', 'memorial', 'refuge', 'funeral'], set: 'grace' },
  { ref: 'Job 19:25', text: 'I know that my redeemer liveth', word: 'REDEEMER', alts: ['HE LIVES', 'I KNOW'], tags: ['memorial', 'hope', 'easter', 'funeral'], set: 'grace' },
  { ref: '2 Corinthians 5:8', text: 'Absent from the body, and to be present with the Lord', word: 'PRESENT', alts: ['WITH THE LORD', 'HOME'], tags: ['memorial', 'funeral', 'hope'], set: 'grace' },
  { ref: 'Psalm 30:5', text: 'Weeping may endure for a night, but joy cometh in the morning', word: 'MORNING', alts: ['JOY COMES', 'WEEPING'], tags: ['grief', 'hope', 'comfort'], set: 'grace' },
  { ref: 'Isaiah 61:3', text: 'To give unto them beauty for ashes', word: 'BEAUTY FOR ASHES', alts: ['BEAUTY', 'RESTORED'], tags: ['grief', 'restoration', 'hope'], set: 'grace' },
  { ref: 'Psalm 73:26', text: 'God is the strength of my heart, and my portion for ever', word: 'MY PORTION', alts: ['FOREVER', 'STRENGTH'], tags: ['comfort', 'memorial', 'strength'], set: 'grace' },

  // ── Healing ────────────────────────────────────────────────────────────────
  { ref: 'Jeremiah 17:14', text: 'Heal me, O LORD, and I shall be healed', word: 'HEALED', alts: ['HEAL ME', 'RESTORED'], tags: ['healing', 'prayer'], set: 'grace' },
  { ref: 'Isaiah 53:5', text: 'And with his stripes we are healed', word: 'HEALED', alts: ['HIS STRIPES', 'BY HIS WOUNDS'], tags: ['healing', 'easter', 'good friday'], set: 'grace' },
  { ref: 'Exodus 15:26', text: 'I am the LORD that healeth thee', word: 'HEALER', alts: ['JEHOVAH RAPHA', 'HEALED'], tags: ['healing', 'names of god'], set: 'grace' },
  { ref: 'James 5:15', text: 'And the prayer of faith shall save the sick', word: 'PRAYER OF FAITH', alts: ['HEALED', 'PRAY'], tags: ['healing', 'prayer'], set: 'grace' },
  { ref: 'Psalm 103:3', text: 'Who healeth all thy diseases', web: 'who heals all your diseases', word: 'HEALING', alts: ['ALL YOUR DISEASES', 'HEALED'], tags: ['healing'], set: 'grace' },
  { ref: '3 John 1:2', text: 'I wish above all things that thou mayest prosper and be in health', word: 'WELL', alts: ['PROSPER', 'HEALTH'], tags: ['healing', 'blessing', 'get well'], set: 'grace' },

  // ── The Nursery Collection: children, baptism, dedication ──────────────────
  { ref: 'Psalm 127:3', text: 'Children are an heritage of the LORD', word: 'HERITAGE', alts: ['A GIFT', 'REWARD'], tags: ['children', 'baby', 'nursery', 'baptism'], set: 'nursery' },
  { ref: 'Proverbs 22:6', text: 'Train up a child in the way he should go', word: 'TRAIN UP', alts: ['THE WAY', 'RAISED'], tags: ['children', 'parenting', 'nursery'], set: 'nursery' },
  { ref: '1 Samuel 1:27', text: 'For this child I prayed', word: 'PRAYED FOR', alts: ['THIS CHILD', 'ANSWERED'], tags: ['children', 'baby', 'nursery', 'adoption', 'baptism'], set: 'nursery' },
  { ref: 'Mark 10:14', text: 'Suffer the little children to come unto me', web: 'Allow the little children to come to me', word: 'LITTLE ONES', alts: ['COME TO ME', 'CHILDREN'], tags: ['children', 'nursery', 'sunday school'], set: 'nursery' },
  { ref: 'Psalm 139:14', text: 'I will praise thee; for I am fearfully and wonderfully made', word: 'WONDERFULLY MADE', alts: ['FEARFULLY MADE', 'MADE'], tags: ['children', 'identity', 'nursery', 'worth'], set: 'nursery' },
  { ref: 'Jeremiah 1:5', text: 'Before I formed thee in the belly I knew thee', word: 'KNOWN', alts: ['CHOSEN', 'BEFORE YOU WERE'], tags: ['children', 'baby', 'identity', 'nursery'], set: 'nursery' },
  { ref: 'Isaiah 54:13', text: 'And all thy children shall be taught of the LORD', word: 'TAUGHT', alts: ['GREAT PEACE', 'CHILDREN'], tags: ['children', 'teaching', 'nursery'], set: 'nursery' },
  { ref: 'Deuteronomy 6:7', text: 'Thou shalt teach them diligently unto thy children', word: 'TEACH THEM', alts: ['DILIGENTLY', 'PASS IT ON'], tags: ['children', 'parenting', 'discipleship'], set: 'nursery' },
  { ref: 'Matthew 18:3', text: 'Except ye be converted, and become as little children', web: 'unless you turn, and become as little children', word: 'AS A CHILD', alts: ['LITTLE CHILDREN', 'HUMBLE'], tags: ['children', 'humility'], set: 'nursery' },
  { ref: '3 John 1:4', text: 'I have no greater joy than to hear that my children walk in truth', word: 'GREATER JOY', alts: ['WALK IN TRUTH', 'MY CHILDREN'], tags: ['children', 'parenting', 'joy'], set: 'nursery' },
  { ref: 'Psalm 8:2', text: 'Out of the mouth of babes and sucklings hast thou ordained strength', word: 'BABES', alts: ['ORDAINED STRENGTH', 'LITTLE VOICES'], tags: ['children', 'nursery'], set: 'nursery' },
  { ref: 'Proverbs 17:6', text: 'Children’s children are the crown of old men', word: 'CROWN', alts: ['GRANDCHILDREN', 'LEGACY'], tags: ['children', 'grandparents', 'legacy'], set: 'nursery' },

  // ── The Cornerstone Collection: work, calling, business ────────────────────
  { ref: 'Colossians 3:23', text: 'Whatsoever ye do, do it heartily, as to the Lord', word: 'HEARTILY', alts: ['AS TO THE LORD', 'YOUR WORK'], tags: ['work', 'business', 'office', 'workshop'], set: 'cornerstone' },
  { ref: 'Proverbs 16:3', text: 'Commit thy works unto the LORD, and thy thoughts shall be established', word: 'COMMIT', alts: ['ESTABLISHED', 'YOUR WORK'], tags: ['work', 'business', 'planning'], set: 'cornerstone' },
  { ref: 'Ecclesiastes 9:10', text: 'Whatsoever thy hand findeth to do, do it with thy might', web: 'Whatever your hand finds to do, do it with your might', word: 'WITH THY MIGHT', alts: ['YOUR HAND', 'DO IT'], tags: ['work', 'diligence', 'workshop'], set: 'cornerstone' },
  { ref: '1 Corinthians 10:31', text: 'Whether therefore ye eat, or drink, or whatsoever ye do, do all to the glory of God', word: 'TO HIS GLORY', alts: ['ALL THINGS', 'GLORY'], tags: ['work', 'purpose', 'kitchen'], set: 'cornerstone' },
  { ref: 'Proverbs 22:29', text: 'Seest thou a man diligent in his business?', word: 'DILIGENCE', alts: ['DILIGENT', 'BEFORE KINGS'], tags: ['work', 'business', 'craft'], set: 'cornerstone' },
  { ref: 'Psalm 90:17', text: 'Establish thou the work of our hands upon us', word: 'OUR HANDS', alts: ['ESTABLISHED', 'THE WORK'], tags: ['work', 'craft', 'workshop', 'business'], set: 'cornerstone' },
  { ref: 'Galatians 6:9', text: 'And let us not be weary in well doing', word: 'PERSEVERE', alts: ['NOT WEARY', 'IN DUE SEASON'], tags: ['work', 'perseverance', 'encouragement'], set: 'cornerstone' },
  { ref: 'Matthew 5:16', text: 'Let your light so shine before men', word: 'LET IT SHINE', alts: ['YOUR LIGHT', 'SHINE'], tags: ['work', 'witness', 'light'], set: 'cornerstone' },
  { ref: 'Ephesians 2:20', text: 'Jesus Christ himself being the chief corner stone', word: 'CORNERSTONE', alts: ['THE FOUNDATION', 'CHIEF CORNER'], tags: ['work', 'foundation', 'church', 'building'], set: 'cornerstone' },
  { ref: 'Psalm 118:22', text: 'The stone which the builders refused is become the head stone of the corner', word: 'CORNERSTONE', alts: ['THE STONE', 'REFUSED'], tags: ['foundation', 'building', 'church'], set: 'cornerstone' },
  { ref: 'Proverbs 27:17', text: 'Iron sharpeneth iron; so a man sharpeneth the countenance of his friend', word: 'IRON', alts: ['SHARPENED', 'FRIENDSHIP'], tags: ['friendship', 'work', 'mentorship', 'workshop'], set: 'cornerstone' },
  { ref: 'Proverbs 11:1', text: 'A just weight is his delight', word: 'JUST WEIGHT', alts: ['INTEGRITY', 'HONEST'], tags: ['business', 'integrity', 'trade'], set: 'cornerstone' },
  { ref: 'Luke 16:10', text: 'He that is faithful in that which is least is faithful also in much', word: 'FAITHFUL', alts: ['IN LITTLE', 'IN MUCH'], tags: ['work', 'integrity', 'stewardship'], set: 'cornerstone' },
  { ref: 'Proverbs 21:5', text: 'The thoughts of the diligent tend only to plenteousness', web: 'The plans of the diligent surely lead to profit', word: 'DILIGENT', alts: ['PLANNING', 'PLENTY'], tags: ['work', 'business', 'planning'], set: 'cornerstone' },

  // ── Wisdom & truth ─────────────────────────────────────────────────────────
  { ref: 'Proverbs 9:10', text: 'The fear of the LORD is the beginning of wisdom', word: 'WISDOM', alts: ['THE BEGINNING', 'FEAR OF THE LORD'], tags: ['wisdom', 'study', 'office'], set: 'cornerstone' },
  { ref: 'James 1:5', text: 'If any of you lack wisdom, let him ask of God', word: 'ASK', alts: ['WISDOM', 'LIBERALLY'], tags: ['wisdom', 'prayer', 'decision'], set: 'cornerstone' },
  { ref: 'John 8:32', text: 'And ye shall know the truth, and the truth shall make you free', word: 'TRUTH', alts: ['FREE', 'KNOW THE TRUTH'], tags: ['truth', 'freedom', 'study'], set: 'cornerstone' },
  { ref: 'Psalm 119:11', text: 'Thy word have I hid in mine heart', word: 'HIDDEN', alts: ['IN MY HEART', 'THE WORD'], tags: ['scripture', 'memory', 'study'], set: 'pilgrim' },
  { ref: 'Proverbs 4:23', text: 'Keep thy heart with all diligence', word: 'GUARD', alts: ['YOUR HEART', 'DILIGENCE'], tags: ['wisdom', 'heart', 'purity'], set: 'pilgrim' },
  { ref: 'Micah 6:8', text: 'To do justly, and to love mercy, and to walk humbly with thy God', word: 'JUSTLY', alts: ['MERCY', 'HUMBLY', 'WALK HUMBLY'], tags: ['justice', 'mercy', 'humility'], set: 'cornerstone' },
  { ref: 'Isaiah 40:8', text: 'The word of our God shall stand for ever', word: 'FOREVER', alts: ['IT STANDS', 'THE WORD'], tags: ['scripture', 'eternity'], set: 'pilgrim' },
  { ref: 'Matthew 24:35', text: 'My words shall not pass away', word: 'ENDURING', alts: ['NEVER PASS', 'HIS WORDS'], tags: ['scripture', 'eternity'], set: 'pilgrim' },
  { ref: 'Proverbs 15:1', text: 'A soft answer turneth away wrath', word: 'SOFT ANSWER', alts: ['GENTLE', 'PEACE'], tags: ['wisdom', 'speech', 'peace'], set: 'cornerstone' },
  { ref: 'Colossians 3:12', text: 'Put on therefore, as the elect of God, holy and beloved, bowels of mercies, kindness', word: 'KINDNESS', alts: ['PUT ON', 'CHOSEN'], tags: ['kindness', 'character'], set: 'covenant' },
  { ref: 'Proverbs 31:25', text: 'Strength and honour are her clothing', word: 'STRENGTH & HONOUR', alts: ['SHE LAUGHS', 'CLOTHED'], tags: ['women', 'strength', 'mothers day'], set: 'covenant' },

  // ── Light & salvation ──────────────────────────────────────────────────────
  { ref: 'John 8:12', text: 'I am the light of the world', word: 'THE LIGHT', alts: ['LIGHT', 'FOLLOW ME'], tags: ['light', 'jesus'], set: 'pilgrim' },
  { ref: 'Matthew 5:14', text: 'Ye are the light of the world', word: 'LIGHT', alts: ['A CITY SET', 'SHINE'], tags: ['light', 'witness'], set: 'cornerstone' },
  { ref: 'John 1:5', text: 'And the light shineth in darkness', word: 'IT SHINES', alts: ['LIGHT', 'IN DARKNESS'], tags: ['light', 'hope', 'advent'], set: 'pilgrim' },
  { ref: 'John 3:16', text: 'For God so loved the world', word: 'SO LOVED', alts: ['LOVE', 'THE WORLD'], tags: ['love', 'salvation', 'gospel'], set: 'grace' },
  { ref: 'Romans 10:9', text: 'If thou shalt confess with thy mouth the Lord Jesus', word: 'CONFESS', alts: ['BELIEVE', 'SAVED'], tags: ['salvation', 'gospel', 'baptism'], set: 'grace' },
  { ref: 'Acts 4:12', text: 'There is none other name under heaven given among men, whereby we must be saved', word: 'THE NAME', alts: ['NO OTHER NAME', 'SAVED'], tags: ['salvation', 'gospel'], set: 'grace' },
  { ref: '2 Corinthians 5:17', text: 'If any man be in Christ, he is a new creature', web: 'if anyone is in Christ, he is a new creation', word: 'NEW CREATION', alts: ['MADE NEW', 'IN CHRIST'], tags: ['new beginnings', 'baptism', 'salvation'], set: 'grace' },
  { ref: 'Ephesians 2:10', text: 'For we are his workmanship', word: 'WORKMANSHIP', alts: ['HIS WORK', 'CREATED'], tags: ['identity', 'purpose', 'craft'], set: 'cornerstone' },
  { ref: 'Isaiah 60:1', text: 'Arise, shine; for thy light is come', word: 'ARISE', alts: ['SHINE', 'YOUR LIGHT'], tags: ['light', 'new beginnings', 'advent'], set: 'pilgrim' },
  { ref: 'John 14:6', text: 'I am the way, the truth, and the life', word: 'THE WAY', alts: ['THE TRUTH', 'THE LIFE'], tags: ['jesus', 'gospel', 'guidance'], set: 'pilgrim' },

  // ── Prayer, stillness, rest ────────────────────────────────────────────────
  { ref: 'Psalm 46:10', text: 'Be still, and know that I am God', word: 'BE STILL', alts: ['KNOW', 'STILL'], tags: ['peace', 'prayer', 'stillness', 'anxiety'], set: 'grace' },
  { ref: 'Philippians 4:6', text: 'Be careful for nothing; but in every thing by prayer and supplication', word: 'PRAY', alts: ['NOTHING', 'IN EVERYTHING'], tags: ['prayer', 'anxiety', 'peace'], set: 'grace' },
  { ref: '1 Thessalonians 5:17', text: 'Pray without ceasing', word: 'WITHOUT CEASING', alts: ['PRAY', 'ALWAYS'], tags: ['prayer'], set: 'pilgrim' },
  { ref: 'Matthew 6:33', text: 'But seek ye first the kingdom of God', web: "But seek first God's Kingdom", word: 'SEEK FIRST', alts: ['THE KINGDOM', 'FIRST'], tags: ['priorities', 'prayer', 'purpose'], set: 'pilgrim' },
  { ref: 'Psalm 5:3', text: 'My voice shalt thou hear in the morning, O LORD', word: 'MORNING', alts: ['HE HEARS', 'EACH MORNING'], tags: ['prayer', 'morning', 'kitchen'], set: 'table' },
  { ref: 'Psalm 55:22', text: 'Cast thy burden upon the LORD, and he shall sustain thee', word: 'CAST IT', alts: ['SUSTAINED', 'YOUR BURDEN'], tags: ['prayer', 'burden', 'comfort'], set: 'grace' },
  { ref: '1 Peter 5:7', text: 'Casting all your care upon him; for he careth for you', word: 'HE CARES', alts: ['CAST YOUR CARE', 'CARED FOR'], tags: ['prayer', 'anxiety', 'comfort'], set: 'grace' },
  { ref: 'Psalm 62:1', text: 'Truly my soul waiteth upon God', word: 'WAIT', alts: ['MY SOUL', 'SILENCE'], tags: ['prayer', 'waiting', 'stillness'], set: 'grace' },
  { ref: 'Exodus 33:14', text: 'My presence shall go with thee, and I will give thee rest', word: 'REST', alts: ['HIS PRESENCE', 'GO WITH YOU'], tags: ['rest', 'presence', 'comfort'], set: 'grace' },
  { ref: 'Psalm 37:7', text: 'Rest in the LORD, and wait patiently for him', web: 'Rest in Yahweh, and wait patiently for him', word: 'REST', alts: ['WAIT', 'PATIENTLY'], tags: ['rest', 'patience', 'bedroom'], set: 'grace' },
  { ref: 'Matthew 6:6', text: 'Pray to thy Father which is in secret', word: 'IN SECRET', alts: ['PRAY', 'THE CLOSET'], tags: ['prayer', 'prayer room'], set: 'pilgrim' },

  // ── Blessing & benediction ─────────────────────────────────────────────────
  { ref: 'Numbers 6:24', text: 'The LORD bless thee, and keep thee', word: 'BLESSING', alts: ['BLESSED & KEPT', 'KEEP THEE'], tags: ['blessing', 'benediction', 'wedding', 'baptism'], set: 'household' },
  { ref: 'Numbers 6:25', text: 'The LORD make his face shine upon thee', word: 'SHINE', alts: ['GRACIOUS', 'HIS FACE'], tags: ['blessing', 'benediction'], set: 'household' },
  { ref: 'Deuteronomy 28:6', text: 'Blessed shalt thou be when thou comest in, and blessed shalt thou be when thou goest out', word: 'COMING & GOING', alts: ['BLESSED', 'IN AND OUT'], tags: ['blessing', 'entry', 'doorway', 'home'], set: 'household' },
  { ref: 'Psalm 1:1', text: 'Blessed is the man that walketh not in the counsel of the ungodly', word: 'BLESSED', alts: ['THE MAN', 'HIS WALK'], tags: ['blessing', 'character'], set: 'pilgrim' },
  { ref: 'Psalm 1:3', text: 'And he shall be like a tree planted by the rivers of water', word: 'ROOTED', alts: ['PLANTED', 'A TREE'], tags: ['blessing', 'growth', 'garden'], set: 'pilgrim' },
  { ref: 'Jeremiah 17:8', text: 'For he shall be as a tree planted by the waters', word: 'PLANTED', alts: ['ROOTED', 'BY THE WATERS'], tags: ['blessing', 'growth', 'garden', 'endurance'], set: 'pilgrim' },
  { ref: 'Psalm 84:11', text: 'No good thing will he withhold from them that walk uprightly', word: 'NO GOOD THING', alts: ['WITHHELD', 'UPRIGHT'], tags: ['blessing', 'provision'], set: 'household' },
  { ref: 'Ephesians 3:20', text: 'Now unto him that is able to do exceeding abundantly above all that we ask or think', word: 'ABUNDANTLY', alts: ['ABLE', 'ABOVE ALL'], tags: ['blessing', 'faith', 'graduation'], set: 'pilgrim' },
  { ref: 'Psalm 115:14', text: 'The LORD shall increase you more and more', word: 'INCREASE', alts: ['MORE AND MORE', 'BLESSED'], tags: ['blessing', 'growth', 'business'], set: 'cornerstone' },
  { ref: 'Malachi 3:10', text: 'And prove me now herewith, saith the LORD of hosts', word: 'PROVE ME', alts: ['OPEN HEAVEN', 'THE WINDOWS'], tags: ['blessing', 'giving', 'provision'], set: 'cornerstone' },

  // ── New beginnings ─────────────────────────────────────────────────────────
  { ref: 'Isaiah 43:19', text: 'Behold, I will do a new thing', word: 'NEW THING', alts: ['BEHOLD', 'MADE NEW'], tags: ['new beginnings', 'new year', 'moving'], set: 'pilgrim' },
  { ref: 'Revelation 21:5', text: 'Behold, I make all things new', word: 'ALL THINGS NEW', alts: ['MADE NEW', 'BEHOLD'], tags: ['new beginnings', 'hope', 'new year'], set: 'pilgrim' },
  { ref: 'Lamentations 3:22', text: 'It is of the LORD’S mercies that we are not consumed', word: 'MERCY', alts: ['NOT CONSUMED', 'HIS MERCIES'], tags: ['mercy', 'new beginnings'], set: 'grace' },
  { ref: 'Philippians 3:14', text: 'I press toward the mark for the prize of the high calling', word: 'PRESS ON', alts: ['THE PRIZE', 'THE CALLING'], tags: ['perseverance', 'graduation', 'sport', 'goals'], set: 'cornerstone' },
  { ref: 'Philippians 3:13', text: 'Forgetting those things which are behind', word: 'FORWARD', alts: ['LET IT GO', 'REACHING'], tags: ['new beginnings', 'forgiveness'], set: 'pilgrim' },
  { ref: 'Ezekiel 36:26', text: 'A new heart also will I give you', web: 'I will also give you a new heart', word: 'NEW HEART', alts: ['MADE NEW', 'A NEW SPIRIT'], tags: ['new beginnings', 'baptism', 'salvation'], set: 'grace' },
  { ref: 'Psalm 51:10', text: 'Create in me a clean heart, O God', word: 'CLEAN HEART', alts: ['RENEWED', 'CREATE IN ME'], tags: ['repentance', 'new beginnings', 'prayer'], set: 'grace' },
  { ref: 'Isaiah 40:31', alias: 'wings', text: 'They shall mount up with wings as eagles', word: 'WINGS', alts: ['AS EAGLES', 'RENEWED'], tags: ['hope', 'strength', 'graduation'], set: 'sentinel' },

  // ── Forgiveness & mercy ────────────────────────────────────────────────────
  { ref: '1 John 1:9', text: 'If we confess our sins, he is faithful and just to forgive us our sins', word: 'FORGIVEN', alts: ['FAITHFUL & JUST', 'CLEANSED'], tags: ['forgiveness', 'mercy', 'confession'], set: 'grace' },
  { ref: 'Ephesians 4:32', text: 'Be ye kind one to another, tenderhearted, forgiving one another', word: 'BE KIND', alts: ['FORGIVING', 'TENDERHEARTED'], tags: ['forgiveness', 'kindness', 'family'], set: 'covenant' },
  { ref: 'Psalm 103:12', text: 'As far as the east is from the west, so far hath he removed our transgressions from us', word: 'REMOVED', alts: ['EAST FROM WEST', 'FORGIVEN'], tags: ['forgiveness', 'mercy'], set: 'grace' },
  { ref: 'Micah 7:19', text: 'Thou wilt cast all their sins into the depths of the sea', word: 'CAST AWAY', alts: ['THE DEPTHS', 'FORGIVEN'], tags: ['forgiveness', 'mercy', 'nautical'], set: 'grace' },
  { ref: 'Psalm 86:5', text: 'For thou, Lord, art good, and ready to forgive', word: 'READY TO FORGIVE', alts: ['HE IS GOOD', 'MERCY'], tags: ['forgiveness', 'mercy'], set: 'grace' },
  { ref: 'Matthew 6:14', text: 'For if ye forgive men their trespasses, your heavenly Father will also forgive you', word: 'FORGIVE', alts: ['MERCY', 'ONE ANOTHER'], tags: ['forgiveness'], set: 'grace' },
  { ref: 'Colossians 3:13', text: 'Forbearing one another, and forgiving one another', word: 'FORBEARANCE', alts: ['FORGIVE', 'ONE ANOTHER'], tags: ['forgiveness', 'family', 'marriage'], set: 'covenant' },
  { ref: 'Luke 6:36', text: 'Be ye therefore merciful, as your Father also is merciful', word: 'MERCIFUL', alts: ['MERCY', 'AS HE IS'], tags: ['mercy', 'character'], set: 'grace' },
];
