import{t as e}from"./framework-CNxXF_6U.js";import{a as t,d as n,i as r,n as i,s as a,t as o}from"./signal-D6bxn1Rn.js";var s=e(),c={"tic-equities-us":`United States
Equities`,"tic-treasuries-us":`United States
Treasuries`,"tic-agency-us":`United States
Agency bonds`,"tic-corporate-us":`United States
Corporate bonds`,"tic-europe-us-securities":`Europe →
United States`,"tic-asia-us-securities":`Asia →
United States`,"tic-japan-us-securities":`Japan →
United States`,"tic-china-us-securities":`China →
United States`,"tic-india-us-securities":`India →
United States`,"tic-south-korea-us-securities":`South Korea →
United States`,"tic-hong-kong-us-securities":`Hong Kong →
United States`,"tic-singapore-us-securities":`Singapore →
United States`,"tic-taiwan-us-securities":`Taiwan →
United States`,"tic-malaysia-us-securities":`Malaysia →
United States`,"tic-indonesia-us-securities":`Indonesia →
United States`,"tic-philippines-us-securities":`Philippines →
United States`,"tic-saudi-arabia-us-securities":`Saudi Arabia →
United States`,"tic-uae-us-securities":`UAE →
United States`,"tic-kuwait-us-securities":`Kuwait →
United States`,"tic-israel-us-securities":`Israel →
United States`,"tic-russia-us-securities":`Russia →
United States`,"tic-turkey-us-securities":`Turkey →
United States`,"tic-latin-america-us-securities":`Latin America →
United States`,"tic-argentina-us-securities":`Argentina →
United States`,"tic-brazil-us-securities":`Brazil →
United States`,"tic-chile-us-securities":`Chile →
United States`,"tic-colombia-us-securities":`Colombia →
United States`,"tic-mexico-us-securities":`Mexico →
United States`,"tic-peru-us-securities":`Peru →
United States`,"tic-africa-us-securities":`Africa →
United States`,"tic-south-africa-us-securities":`South Africa →
United States`},l=t.filter(e=>e.sourceId in c&&n(e.sourceId).track===`flowTrend`).sort((e,t)=>Math.abs(t.score)-Math.abs(e.score));function u(){return(0,s.jsx)(i,{title:`Flows`,children:(0,s.jsxs)(`section`,{className:`flow-board`,"aria-labelledby":`page-title`,children:[(0,s.jsxs)(`div`,{className:`flow-board-head`,children:[(0,s.jsx)(`h1`,{id:`page-title`,children:`Cross-border flows`}),(0,s.jsx)(`p`,{children:r.dataThrough})]}),(0,s.jsx)(`div`,{className:`flow-cards`,children:l.map(e=>{let t=e.score>0;return(0,s.jsxs)(`article`,{className:`flow-card tone-${t?`positive`:`negative`}`,children:[(0,s.jsx)(`span`,{className:`flow-arrow`,"aria-hidden":`true`,children:t?`↑`:`↓`}),(0,s.jsx)(`span`,{className:`flow-direction`,children:t?`MONEY MOVING IN`:`MONEY MOVING OUT`}),(0,s.jsx)(`h2`,{children:c[e.sourceId].split(`
`).map(e=>(0,s.jsxs)(`span`,{children:[e,(0,s.jsx)(`br`,{})]},e))}),(0,s.jsx)(`span`,{className:`flow-score`,children:a(e.score)}),(0,s.jsx)(o,{score:e.score})]},e.sourceId)})})]})})}export{u as default};