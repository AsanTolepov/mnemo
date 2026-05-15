const fs = require('fs');
let content = fs.readFileSync('services/translations.ts', 'utf8');

const qqTranslations = {
    controlCenter: 'Basqarıw orayı',
    monitoring: 'Monitoring',
    login: 'Kiriw',
    logout: 'Shıǵıw',
    terminateSession: 'Sessiyanı juwmaqlaw',
    greeting: 'Qayrli tań',
    architect: 'Arxitektor',
    optimalState: 'Optimal jaǵday anıqlandı',
    trainingModules: 'Trening modulları',
    selectAbilities: 'Kognitiv qábiletlerińizdi tańlań',
    allExercises: 'Barlıq shınıǵıwlar',
    currentStreak: 'Kúnlik izbe-izlik',
    globalRanking: 'Global reyting',
    averageAccuracy: 'Ortasha anıqlıq',
    days: 'kún',
    top5: 'Eń jaqsı 5%',
    statDiscipline: 'Kúnlik háreketler hám tártip',
    statTimeLimit: 'Kúnine 1-2 saat waqıt ajıratıw',
    statProgress: '75% ten 100% ge shekemgi nátiyje',
    numberMatrix: 'Sanlar matricası',
    wordChains: 'Sózler shınjırı',
    playingCards: 'Oyın kartaları',
    faceName: 'Júz hám atı',
    abstractImages: 'Abstrakt kórinisler',
    back: 'Artqa',
    selectCount: 'Kartalar sanın tańlań',
    max52: 'dana (maksimum 52)',
    startPractice: 'Shınıǵıwdı baslaw',
    studyStage: 'Yadlaw basqıshı',
    testStage: 'Tekseriw basqıshı',
    flipHint: 'Kartanı awdarıw ushın ústine basıń',
    prev: 'Aldınǵı',
    next: 'Keyingi',
    startTest: 'Testti baslaw',
    seeResult: 'Nátiyjeni kóriw',
    writeWord: 'Bul kartaǵa baylanıslı sózdi jazıń',
    enterWord: 'Mısalı: Ayıw',
    results: 'Nátiyjeler',
    restart: 'Qayta baslaw',
    loginRequired: 'Monitoring ushın sistemaǵa kiriń',
    statsMonitoring: 'Statistika monitoringi',
    noDataYet: 'Házirshe maǵlıwmatlar joq',
    performExerciseHint: 'Birer shınıǵıwdı orınlań hám nátiyjeńiz usı jerde kórinedi.',
    accuracy: 'Anıqlıq',
    statistics: 'Statistika',
    notLoggedIn: 'Siz ele dizimge kirmegensiz',
    period1Day: '1 kúnlik',
    period1Week: '1 háptelik',
    period1Month: '1 aylıq',
    speed: 'Tezlik',
    digitCountLabel: 'Sanlar muǵdarı',
    groupingLabel: 'Toparlaw forması',
    durationLabel: 'Kórsetiw waqtı',
    seconds: 'sekund',
    settings: 'Sazlawlar',
    deepFocus: 'Tereń itibar',
    ready: 'Tayarman',
    phaseMemorization: 'Yadlaw basqıshı',
    phaseRecall: 'Eslew basqıshı',
    recallHint: 'Eslep qalǵanlarıńızdı jazıń',
    submitResult: 'Nátiyjeni jiberiw',
    resultsTitle: 'Shınıǵıw nátiyjeleri',
    accuracyIndicator: 'Anıq nátiyje kórsetkishi',
    comparisonAnalysis: 'Salıstırmalı analiz',
    originalSequence: 'Túpnusqa izbe-izlik',
    yourResponse: 'Siziń juwabıńız',
    playAgain: 'Qayta oynaw',
    neuralArena: 'Neyro Arena',
    chainMethod: 'Shınjır usılı',
    memorizeOrder: 'Sózlerdi izbe-izlikte yadlań',
    recallMethod: 'Eslew usılı',
    seqLength: 'Izbe-izlik uzınlıǵı',
    wordCountLabel: 'sóz',
    memorizeTime: 'Yadlaw waqtı',
    patternTitle: 'Abstrakt figuralardıń jaylasıwın yadlań',
    gridSize: 'Kletkalar ólshemi',
    shapeType: 'Figura túri',
    square: 'Kvadrat',
    circle: 'Sheńber',
    diamond: 'Romb',
    manual: 'Qolda',
    shapeCountLabel: 'Figuralar sanı',
    memorizePattern: 'Figuralardı yadlań',
    recallPattern: 'Figuralardı tikleń',
    recallPatternHint: 'Figuralar turǵan orındı belgileń',
    originalPattern: 'Haqıyqıy jaǵdayı',
    faceNameTitle: 'Júz hám At',
    faceNameDesc: 'Adamlardıń júzleri hám atların baylanıstırıp esleń',
    faceNameRule: 'Hár bir súwret astındaǵı atı hám lawazımın yadlań.',
    faceNameHint: 'Keyingi basqıshta súwretlerge qarap atlardı jazıwıńız kerek boladı.',
    loadingFaces: 'Júzler júklenbekte...',
    memorizeFaces: 'Júzlerdi yadlań',
    personLabel: 'Shaxs',
    recallNames: 'Atlardı tikleń',
    recallNamesHint: 'Hár bir adamnıń atın kiritin',
    enterName: 'Atın kiritiń',
    correct: 'Durıs'
};

// Playing cards translations (52 cards) 
const cardWordsQQ = {
    'A♥': 'Ayıw', '2♥': 'Júzik', '3♥': 'Alma', '4♥': 'Arra', '5♥': 'Esiq', '6♥': 'Pil', '7♥': 'Ǵaz', '8♥': 'Hasa', '9♥': 'Pıshaq', '10♥': 'Taw', 'J♥': 'Jiyren', 'Q♥': 'Qálb', 'K♥': 'Hákim',
    'A♦': 'Gishti', '2♦': 'Terek', '3♦': 'Dáshat', '4♦': 'Sheńber', '5♦': 'Mámleket', '6♦': 'Dos', '7♦': 'Dúrbi', '8♦': 'Dastak', '9♦': 'Teńiz', '10♦': 'Dápter', 'J♦': 'Márt', 'Q♦': 'Dana', 'K♦': 'Oyshıl',
    'A♣': 'Gilt', '2♣': 'Kitap', '3♣': 'Kubok', '4♣': 'Kamar', '5♣': 'Gúbelek', '6♣': 'Top', '7♣': 'Keme', '8♣': 'Karkidon', '9♣': 'Kógershin', '10♣': 'Kravat', 'J♣': 'Kishi', 'Q♣': 'Kelin', 'K♣': 'Kúshik',
    'A♠': 'Qarǵa', '2♠': 'Qazan', '3♠': 'Qasıq', '4♠': 'Qayshı', '5♠': 'Qawın', '6♠': 'Quyash', '7♠': 'Qálem', '8♠': 'Qaǵaz', '9♠': 'Qulıp', '10♠': 'Qap', 'J♠': 'Qoy', 'Q♠': 'Qızıl', 'K♠': 'Garrı'
};

// Replace regular translations
Object.keys(qqTranslations).forEach(key => {
    const val = qqTranslations[key];
    const regex = new RegExp(`(${key}:\\s*\\{[^}]+qq:\\s*)('[^']*'|"[^"]*")(\\s*\\})`, 'g');
    content = content.replace(regex, `$1'${val}'$3`);
});

// Replace card mnemonic translations
Object.keys(cardWordsQQ).forEach(key => {
    const val = cardWordsQQ[key];
    // escape regex characters in key like A♥
    const safeKey = key.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`('${safeKey}':\\s*\\{[^}]+qq:\\s*)('[^']*'|"[^"]*")(\\s*\\})`, 'g');
    content = content.replace(regex, `$1'${val}'$3`);
});

fs.writeFileSync('services/translations.ts', content);
console.log('Done translating to pure QQ');
