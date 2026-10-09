import React, { useState } from 'react';
import { Play, CheckCircle2, XCircle, RotateCcw, Volume2, Award, ArrowRight } from 'lucide-react';
import { QUIZ_QUESTIONS, QuizQuestion } from '../data/ww2HistoricalData';
import { soundEngine } from '../services/audioEngine';

export const AcousticQuizView: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isQuizFinished, setIsQuizFinished] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const currentQuestion: QuizQuestion = QUIZ_QUESTIONS[currentIndex];

  const handlePlaySound = () => {
    if (!currentQuestion.soundAction) return;
    soundEngine.ensureRunning();
    setIsPlayingAudio(true);

    switch (currentQuestion.soundAction) {
      case 'm1garand':
        soundEngine.playM1Garand(8, true, 'near', 0);
        break;
      case 'stuka':
        soundEngine.playStukaDive('near', 0);
        break;
      case 'mg42':
        soundEngine.playMG42(1.2, 'near', 0);
        break;
      case 'katyusha':
        soundEngine.playKatyushaSalvo(8, -0.2);
        break;
      case 'mortar':
        soundEngine.playMortar('near', 0);
        break;
      default:
        soundEngine.playArtilleryBlast('near', 0);
        break;
    }

    setTimeout(() => {
      setIsPlayingAudio(false);
    }, 2500);
  };

  const handleSelectOption = (index: number) => {
    if (isAnswered) return;
    setSelectedOption(index);
    setIsAnswered(true);

    if (index === currentQuestion.correctIndex) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < QUIZ_QUESTIONS.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setIsQuizFinished(true);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setIsQuizFinished(false);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="border-b border-stone-800 pb-6 text-center">
        <div className="flex items-center justify-center gap-2 text-xs text-amber-500 mb-1">
          <span>Reconhecimento Acústico & História Militar</span>
          <span aria-hidden="true">·</span>
          <span>Desafio Interativo</span>
        </div>
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-stone-100">
          Desafio de Reconhecimento Acústico
        </h2>
        <p className="mt-2 text-sm text-stone-300 max-w-xl mx-auto">
          No campo de batalha, distinguir o som de uma metralhadora ou o mergulho de um avião era a diferença entre a vida e a morte. Teste sua percepção auditiva e conhecimento histórico.
        </p>
      </div>

      {!isQuizFinished ? (
        <div className="rounded-xl border border-stone-800 bg-stone-900 p-6 sm:p-8 space-y-6 shadow-xl">
          {/* Progress bar and counter */}
          <div className="flex items-center justify-between text-xs text-stone-400">
            <span>
              Questão <span className="font-mono font-bold text-stone-200">{currentIndex + 1}</span> de {QUIZ_QUESTIONS.length}
            </span>
            <span className="font-mono">
              Pontuação: {score}/{currentIndex + (isAnswered ? 1 : 0)}
            </span>
          </div>

          <div className="w-full bg-stone-950 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-amber-500 h-full transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / QUIZ_QUESTIONS.length) * 100}%` }}
            />
          </div>

          {/* Question Text */}
          <h3 className="font-display text-lg sm:text-xl font-bold text-stone-100 text-balance">
            {currentQuestion.question}
          </h3>

          {/* Sound trigger button if question has sound */}
          {currentQuestion.soundAction && (
            <div className="p-4 rounded-lg bg-stone-950/70 border border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2.5 text-xs text-stone-300">
                <Volume2 className="h-4 w-4 text-amber-500 shrink-0" />
                <span>Pista sonora: reproduza o som característico para identificar a arma.</span>
              </div>
              <button
                onClick={handlePlaySound}
                className={`flex items-center gap-2 rounded px-4 py-2 text-xs font-semibold transition-all shrink-0 ${
                  isPlayingAudio
                    ? 'bg-amber-500 text-stone-950 ring-2 ring-amber-400'
                    : 'bg-stone-800 hover:bg-amber-600 text-stone-100'
                }`}
              >
                <Play className="h-3.5 w-3.5 fill-current" />
                <span>{isPlayingAudio ? 'Reproduzindo Áudio...' : 'Ouvir Som da Arma'}</span>
              </button>
            </div>
          )}

          {/* Options */}
          <div className="grid grid-cols-1 gap-3">
            {currentQuestion.options.map((option, index) => {
              const isSelected = selectedOption === index;
              const isCorrect = index === currentQuestion.correctIndex;

              let btnStyle = 'border-stone-800 bg-stone-950/50 hover:bg-stone-800/80 text-stone-200';
              if (isAnswered) {
                if (isCorrect) {
                  btnStyle = 'border-emerald-600 bg-emerald-950/40 text-emerald-200 font-semibold';
                } else if (isSelected) {
                  btnStyle = 'border-rose-600 bg-rose-950/40 text-rose-200';
                } else {
                  btnStyle = 'border-stone-800 bg-stone-950/30 text-stone-500 opacity-60';
                }
              }

              return (
                <button
                  key={index}
                  onClick={() => handleSelectOption(index)}
                  disabled={isAnswered}
                  className={`flex items-center justify-between rounded-lg border p-4 text-left text-sm transition-all ${btnStyle}`}
                >
                  <span className="leading-relaxed">{option}</span>
                  {isAnswered && isCorrect && (
                    <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 ml-3" />
                  )}
                  {isAnswered && isSelected && !isCorrect && (
                    <XCircle className="h-5 w-5 text-rose-400 shrink-0 ml-3" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Explanation Banner */}
          {isAnswered && (
            <div className="rounded-lg border border-amber-900/50 bg-stone-950 p-4 space-y-2 text-xs animate-in fade-in">
              <div className="font-semibold text-amber-400">
                {selectedOption === currentQuestion.correctIndex ? 'Correto!' : 'Explicação Pedagógica:'}
              </div>
              <p className="text-stone-300 leading-relaxed">
                {currentQuestion.explanation}
              </p>
              <div className="pt-2 border-t border-stone-800 text-stone-400">
                <span className="font-semibold text-stone-300">Fato Histórico:</span> {currentQuestion.historicalFact}
              </div>

              <div className="pt-3 flex justify-end">
                <button
                  onClick={handleNext}
                  className="flex items-center gap-2 rounded bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold px-4 py-2 text-xs transition-colors"
                >
                  <span>{currentIndex < QUIZ_QUESTIONS.length - 1 ? 'Próxima Pergunta' : 'Ver Resultado'}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Quiz Finished Summary */
        <div className="rounded-xl border border-stone-800 bg-stone-900 p-8 text-center space-y-6 shadow-xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-950/60 border border-amber-600/40 text-amber-400">
            <Award className="h-8 w-8" />
          </div>
          <div>
            <h3 className="font-display text-2xl font-bold text-stone-100">
              Desafio Concluído!
            </h3>
            <p className="text-sm text-stone-300 mt-1">
              Você acertou <span className="font-mono font-bold text-amber-400">{score}</span> de {QUIZ_QUESTIONS.length} perguntas.
            </p>
            <p className="text-xs text-stone-400 mt-2 max-w-md mx-auto">
              {score === QUIZ_QUESTIONS.length
                ? 'Excelente acuidade acústica e histórico militar! Você possui o ouvido treinado de um veterano de trincheira.'
                : score >= 3
                ? 'Muito bom! Você reconhece a maioria das assinaturas sonoras cruciais da Segunda Guerra Mundial.'
                : 'Bom esforço! Use o Museu do Armamento e os Cenários para fixar ainda mais as características de cada arma.'}
            </p>
          </div>

          <button
            onClick={handleRestart}
            className="inline-flex items-center gap-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold px-5 py-2.5 text-xs sm:text-sm transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Repetir Desafio</span>
          </button>
        </div>
      )}
    </div>
  );
};
