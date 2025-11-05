// Simple quiz app
(async function(){
  const loading = document.getElementById('loading')
  const quizEl = document.getElementById('quiz')
  const questionEl = document.getElementById('question')
  const optionsEl = document.getElementById('options')
  const nextBtn = document.getElementById('next')
  const resultEl = document.getElementById('result')
  const answeredEl = document.getElementById('answered')
  const totalEl = document.getElementById('total')
  const correctCountEl = document.getElementById('correctCount')
  const totalCountEl = document.getElementById('totalCount')
  const percentEl = document.getElementById('percent')
  const restartBtn = document.getElementById('restart')

  let pool = []
  try{
    const resp = await fetch('data/all_questions.json')
    pool = await resp.json()
  }catch(e){
    loading.textContent = 'Fejl ved innlasting av spørsmål.'
    console.error(e)
    return
  }
  if(!Array.isArray(pool) || pool.length===0){
    loading.textContent = 'Ingen spørsmål funnet.'
    return
  }

  // state
  let remaining = [...pool]
  let answered = 0
  let correct = 0

  function showCard(q){
    questionEl.textContent = `${q.question}`
    optionsEl.innerHTML = ''
    const letters = Object.keys(q.options)
    letters.forEach(l=>{
      const btn = document.createElement('button')
      btn.className = 'opt'
      btn.textContent = `${l}: ${q.options[l]}`
      btn.dataset.letter = l
      btn.onclick = ()=>onChoose(q, btn)
      optionsEl.appendChild(btn)
    })
  }

  function onChoose(q, btn){
    // disable all
    Array.from(optionsEl.children).forEach(b=>b.disabled = true)
    const user = btn.dataset.letter
    const correctLetter = q.answer
    // mark
    Array.from(optionsEl.children).forEach(b=>{
      if(b.dataset.letter === correctLetter){
        b.classList.add('correct')
      }
      if(b.dataset.letter === user && user !== correctLetter){
        b.classList.add('wrong')
      }
    })
    if(user === correctLetter) correct++
    answered++
    answeredEl.textContent = answered
    nextBtn.classList.remove('hidden')
    nextBtn.disabled = false
  }

  function pickRandom(){
    if(remaining.length===0) return null
    const i = Math.floor(Math.random()*remaining.length)
    const q = remaining.splice(i,1)[0]
    return q
  }

  function showResult(){
    quizEl.classList.add('hidden')
    resultEl.classList.remove('hidden')
    correctCountEl.textContent = correct
    totalCountEl.textContent = pool.length
    percentEl.textContent = Math.round((correct/pool.length)*100) + '%'
  }

  nextBtn.addEventListener('click', ()=>{
    nextBtn.classList.add('hidden')
    const q = pickRandom()
    if(!q){
      showResult();
      return
    }
    showCard(q)
  })

  restartBtn.addEventListener('click', ()=>{
    // reset
    remaining = [...pool]
    answered = 0
    correct = 0
    answeredEl.textContent = 0
    resultEl.classList.add('hidden')
    quizEl.classList.remove('hidden')
    nextBtn.classList.add('hidden')
    const q = pickRandom()
    if(q) showCard(q)
  })

  // init
  totalEl.textContent = pool.length
  loading.classList.add('hidden')
  quizEl.classList.remove('hidden')
  answeredEl.textContent = 0
  const first = pickRandom()
  if(first) showCard(first)

})();
