import {lettering,rect,smooth,step} from './paint.mjs';
import {buyOne,feedback} from './squeeze-crowd.mjs';
import {giveBack,sale} from './squeeze-performance.mjs';
import {floatCount,lendChain,market,mono,paperwork,settleChain,splitShare} from './gamestop-exhibits.mjs';
import {buybackNote,digital,forum,gameShop,gillDesk,hearing,opposingTheses,rewind,storefront,tradeApp,twoSides} from './gamestop-scenes.mjs';

const highs=[
  ['JAN 11',20.65,'INTRADAY HIGH'],
  ['JAN 13',31.40,'CLOSE'],
  ['JAN 22',72,'INTRADAY'],
  ['JAN 27',347.51,'CLOSE'],
  ['JAN 28',483,'INTRADAY HIGH'],
];
const source='SEC STAFF REPORT · OCT 2021';
const marketShot=(points,options={})=>({
  sets:['pit'],
  paint:(ctx,view,assets,p)=>market(ctx,view,assets,p,{points,note:'SELECTED QUOTES · PRE-SPLIT',...options}),
});
const sheet=(heading,sub,rows,seal)=>({
  sets:[],
  paint:(ctx,view,_assets,p)=>paperwork(ctx,view,p,{heading,sub,rows,seal}),
});
const draw=(sets,paint,options)=>({sets,paint:(ctx,view,assets,p)=>paint(ctx,view,assets,p,options)});
const lend=(options)=>({sets:[],paint:(ctx,view,_assets,p)=>lendChain(ctx,view,p,options)});
const clearing=(stage)=>draw(['clearing'],settleChain,{stage});
function exampleLabel(ctx,view) {
  const w=view.portrait?141:188;
  rect(ctx,view.w*.055,581,w,27,4,'#252331e8','#93715c',1);
  lettering(ctx,'ILLUSTRATIVE TRADE',view.w*.055+w/2,594,{size:view.portrait?10:13,color:'#f0d4af',family:mono});
}
const techExample=(paint)=>({
  sets:['pit'],
  paint:(ctx,view,assets,p)=>{
    paint(ctx,view,assets,p);
    exampleLabel(ctx,view);
  },
});
const profit=sheet('The price falls','ILLUSTRATIVE SHORT TRADE · ONE SHARE',[['Sell the borrowed share','+$20'],['Buy a replacement','−$10','#934757'],['Profit before costs','+$10']],'RETURN ONE SHARE TO THE LENDER');

export const gamestop={
  sets:{
    pit:'films/short-squeeze/pit.webp',
    exchange:'films/short-squeeze/exchange.webp',
    mall:'films/gamestop/mall.webp',
    shop:'films/gamestop/shop.webp',
    desk:'films/gamestop/desk.webp',
    clearing:'films/gamestop/clearing.webp',
  },
  shots:{
    opening:marketShot(highs,{black:true}),
    milestones:sheet('Two quotes, one stock',source,[['Jan 11 · intraday high','$20.65'],['Jan 28 · intraday high','$483.00']],'JANUARY 2021 · PRE-SPLIT'),
    'two-sides':draw(['desk','clearing'],twoSides),
    restriction:draw(['desk'],tradeApp,{first:true}),
    rewind:draw(['desk','mall'],rewind),
    store:draw(['mall'],storefront),
    shop:draw(['shop'],gameShop),
    download:draw(['shop','desk'],digital),
    shutters:draw(['mall'],storefront,{closed:true}),
    theses:draw(['clearing'],opposingTheses),
    long:sheet('Buying one share','ILLUSTRATIVE TRADE · BEFORE COSTS',[['Purchase price','$20'],['Sale price','$30'],['Profit','+$10']]),
    profit:{
      sets:['exchange'],
      paint:(ctx,view,assets,p)=>{
        if(p<.34) {
          sale(ctx,view,assets,step(p,0,.34));
          exampleLabel(ctx,view);
        } else if(p<.70) {
          giveBack(ctx,view,assets,.84*step(p,.34,.70));
          exampleLabel(ctx,view);
        } else {
          profit.paint(ctx,view,assets,.58+.42*step(p,.70,1));
        }
      },
    },
    loss:sheet('The price rises','ILLUSTRATIVE SHORT TRADE · ONE SHARE',[['Sell the borrowed share','+$20'],['Buy back at $50','−$30 net','#934757'],['Buy back at $100','−$80 net','#934757']],'ONE SHARE IS STILL OWED'),
    ceiling:sheet('How far can the loss go?','ILLUSTRATIVE ONE-SHARE POSITIONS',[['Buy at $20 · price falls to $0','−$20','#934757'],['Short at $20 · buy back at $200','−$180','#934757']],'BEFORE COSTS'),
    rush:techExample(buyOne),
    squeeze:techExample(feedback),
    float:{sets:[],paint:(ctx,view,_assets,p)=>floatCount(ctx,view,p)},
    'relend-first':lend({second:false}),
    'relend-second':lend({second:true}),
    vulnerability:techExample(feedback),
    spark:draw(['desk'],forum,{spark:true}),
    gill:draw(['desk'],gillDesk,false),
    thesis:draw(['desk'],gillDesk,true),
    cohen:sheet('A new board member','GAMESTOP · JANUARY 11, 2021',[['Investor','Ryan Cohen'],['Background','Chewy co-founder'],['Investor thesis','Digital turnaround']],'GAMESTOP SEC FILING'),
    forum:draw(['desk'],forum),
    attention:draw(['desk','clearing'],twoSides),
    jan13:sheet('Volume jumps','GAMESTOP · JANUARY 13, 2021',[['Jan 12 volume','~7 million'],['Jan 13 volume','~144 million'],['Jan 13 close','$31.40']],source),
    jan22:marketShot([['JAN 22',43,'EARLIER'],['JAN 22',72,'~3 HOURS LATER']],{note:'INTRADAY SNAPSHOTS · JAN 22, 2021'}),
    accounts:sheet('More traders arrive','GAMESTOP · INDIVIDUAL ACCOUNTS ON A TRADING DAY',[['Start of January','Under 10,000'],['January 27','Nearly 900,000']],source),
    peak:marketShot(highs.slice(-2)),
    'report-cover':sheet('What sustained the rally?',source,[['Buying to cover','Helped at times'],['Wider demand','Sustained the rise']]),
    receipt:{
      sets:['desk','clearing'],
      paint:(ctx,view,assets,p)=>{
        if(p<.38) tradeApp(ctx,view,assets,step(p,0,.38),{locked:false});
        else settleChain(ctx,view,assets,step(p,.38,1),{stage:0});
      },
    },
    clearing:clearing(1),
    unsettled:clearing(2),
    deposit:clearing(3),
    'restricted-again':draw(['desk'],tradeApp),
    limits:draw(['desk'],tradeApp,{limited:true}),
    drop:marketShot([['JAN 28',483,'INTRADAY HIGH'],['FEB 19',40.59,'AS LOW AS']],{fall:true}),
    'two-receipts':sheet('Same sale, different result','ILLUSTRATIVE · BOTH SELL AT $40',[['Bought at $20','+$20'],['Bought at $400','−$360','#934757']],'PER SHARE · BEFORE COSTS'),
    hearing:{sets:[],paint:(ctx,view,_assets,p)=>hearing(ctx,view,p)},
    'sec-file':sheet('Short covering and demand',source,[['Short covering','One source of buying'],['Total demand','Many other buyers'],['Weeks-long rally','Broader enthusiasm']]),
    split:{sets:[],paint:(ctx,view,_assets,p)=>splitShare(ctx,view,p)},
    'recap-loan':{
      sets:[],paint:(ctx,view,_assets,p)=>lendChain(ctx,view,step(p,p<.44?0:.44,p<.44?.44:1),{second:p>=.44,recap:true}),
    },
    'recap-bids':{
      sets:['pit'],paint:(ctx,view,assets,p)=>{
        if(p<.36) buybackNote(ctx,view,step(p,0,.36));
        else {
          feedback(ctx,view,assets,step(p,.36,1));
          exampleLabel(ctx,view);
        }
      },
    },
    'recap-clearing':clearing(3),
    'recap-phone':draw(['desk'],tradeApp),
    end:draw(['mall'],storefront,{end:true}),
  },
};
