import React, { useState } from 'react';
import { Disc3, Play, Calendar } from 'lucide-react';
import { QuizGame } from './QuizGame';
import { audioEngine } from '../services/audioEngine';

interface Props {
  lang: 'en' | 'hi';
}

const DECADES = [
  {
    id: '1950s',
    labelEn: '1950s: The Golden Era',
    labelHi: '१९५० का दशक: स्वर्ण युग',
    desc: 'Raj Kapoor, Nargis, Shankar-Jaikishan, Mukesh & timeless socialist romances.',
    sampleTracks: ['Awaara Hoon', 'Mera Joota Hai Japani', 'Pyaar Hua Iqraar Hua'],
    color: 'from-amber-600 to-yellow-500'
  },
  {
    id: '1960s',
    labelEn: '1960s: Royal Melodies & Freedom',
    labelHi: '१९६० का दशक: राग और रूमानियत',
    desc: 'Mughal-e-Azam grandeur, S.D. Burman brilliance in Guide, Mohammed Rafi mastery.',
    sampleTracks: ['Pyaar Kiya To Darna Kya', 'Aaj Phir Jeene Ki Tamanna Hai'],
    color: 'from-orange-600 to-amber-500'
  },
  {
    id: '1970s',
    labelEn: '1970s: Pancham & Kishore Revolution',
    labelHi: '१९७० का दशक: पंचम और किशोर क्रांति',
    desc: 'R.D. Burman acoustic innovations, Sholay anthems, whistling melodies of Rajesh Khanna.',
    sampleTracks: ['Yeh Dosti', 'Chura Liya Hai', 'Yeh Shaam Mastani', 'Mehbooba Mehbooba'],
    color: 'from-rose-600 to-orange-500'
  },
  {
    id: '1980s',
    labelEn: '1980s: Disco, Silsila & Synthesizers',
    labelHi: '१९८० का दशक: डिस्को और विनाइल युग',
    desc: 'Karz electric guitars, Bappi Lahiri disco anthems, Yash Chopra Keukenhof tulip romance.',
    sampleTracks: ['Om Shanti Om', 'Ek Haseena Thi', 'Dekha Ek Khwaab'],
    color: 'from-fuchsia-600 to-pink-500'
  },
  {
    id: '1990s',
    labelEn: '1990s: Melodic Renaissance',
    labelHi: '१९९० का दशक: मखमली धुनों की वापसी',
    desc: 'DDLJ mustard fields, Kumar Sanu & Alka Yagnik dominance, A.R. Rahman train rhythms.',
    sampleTracks: ['Tujhe Dekha Toh', 'Pehla Nasha', 'Chaiyya Chaiyya', 'Kuch Kuch Hota Hai'],
    color: 'from-blue-600 to-indigo-500'
  },
  {
    id: '2000s',
    labelEn: '2000s: Millennial & Acoustic Youth',
    labelHi: '२००० का दशक: नए भारत की आवाज़',
    desc: 'Dil Chahta Hai Goa vibes, Kal Ho Naa Ho pathos, KK heartbreak ballads, Jab We Met.',
    sampleTracks: ['Kal Ho Naa Ho', 'Dil Chahta Hai', 'Aankhon Mein Teri', 'Tum Se Hi'],
    color: 'from-teal-600 to-emerald-500'
  },
  {
    id: '2010s',
    labelEn: '2010s: The Arijit & Pritam Wave',
    labelHi: '२०१० का दशक: अरिजीत और प्रीतम लहर',
    desc: 'Aashiqui 2 monsoon heartbreak, YJHD youth anthems, Ae Dil Hai Mushkil intense ballads.',
    sampleTracks: ['Tum Hi Ho', 'Kabira', 'Badtameez Dil', 'Channa Mereya'],
    color: 'from-purple-600 to-violet-500'
  },
  {
    id: '2020s',
    labelEn: '2020s: Modern Streaming & Viral Hooks',
    labelHi: '२०२० का दशक: वायरल बीट्स और मॉडर्न पॉप',
    desc: 'Brahmastra acoustic sweeps, Jawan dance grooves, Vicky Kaushal Tauba Tauba virality.',
    sampleTracks: ['Kesariya', 'Apna Bana Le', 'Chaleya', 'Tauba Tauba'],
    color: 'from-pink-600 to-rose-500'
  }
];

export const DecadesView: React.FC<Props> = ({ lang }) => {
  const [selectedDecade, setSelectedDecade] = useState<string | null>(null);

  if (selectedDecade) {
    return (
      <div>
        <div className="max-w-2xl mx-auto px-4 pt-6">
          <button
            onClick={() => {
              audioEngine.stop();
              setSelectedDecade(null);
            }}
            className="text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1 mb-2"
          >
            ← Back to All Decades
          </button>
        </div>
        <QuizGame categoryType="decade" categoryValue={selectedDecade} lang={lang} />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-bollywood-gold/10 border border-bollywood-gold/30 text-bollywood-gold text-xs font-bold mb-3">
          <Disc3 className="w-4 h-4" />
          <span>HINDI CINEMA TIMELINE</span>
        </div>
        <h2 className="text-3xl font-black text-white">
          {lang === 'hi' ? 'दशकों के अनुसार संगीत पहचानें' : 'Browse Bollywood by Decades'}
        </h2>
        <p className="text-sm text-slate-400 mt-2">
          From the monophonic 78-rpm vinyl records of 1950s Raj Kapoor films to the streaming hooks of today.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {DECADES.map(d => (
          <div
            key={d.id}
            className="bg-bollywood-surface border border-bollywood-border/80 hover:border-bollywood-gold/60 rounded-3xl p-5 shadow-xl flex flex-col justify-between group transition-all"
          >
            <div>
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${d.color} flex items-center justify-center text-slate-950 font-black text-sm mb-4 shadow-lg group-hover:scale-105 transition-transform`}>
                <Calendar className="w-6 h-6 text-slate-950 stroke-[2.5]" />
              </div>
              <h3 className="font-black text-lg text-white group-hover:text-amber-400 transition-colors">
                {lang === 'hi' ? d.labelHi : d.labelEn}
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                {d.desc}
              </p>

              <div className="mt-4 pt-3 border-t border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1.5">Signature Tracks:</span>
                <div className="flex flex-wrap gap-1">
                  {d.sampleTracks.map(t => (
                    <span key={t} className="text-[10px] px-2 py-0.5 rounded-md bg-slate-900 text-slate-300 border border-slate-800">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedDecade(d.id)}
              className="mt-6 w-full py-2.5 rounded-xl bg-slate-900 hover:bg-bollywood-gold hover:text-slate-950 text-slate-200 text-xs font-bold border border-slate-700 hover:border-bollywood-gold transition-all flex items-center justify-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Play {d.id} Quiz
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
