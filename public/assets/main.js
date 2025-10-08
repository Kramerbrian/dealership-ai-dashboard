var l="pk_test_ZXhjaXRpbmctcXVhZ2dhLTY1LmNsZXJrLmFjY291bnRzLmRldiQ",a="dash.dealershipai.com",r="https://marketing.dealershipai.com",n=class{constructor(){this.clerk=null;this.initialized=!1;window.Clerk||(window.Clerk={user:null,loaded:!1,isSignedIn:()=>!1,signOut:()=>Promise.resolve(),openSignIn:()=>{},openSignUp:()=>{}}),this.initPromise=this.initialize()}async waitForClerk(e=3e4){let i=Date.now();for(;!window.Clerk&&Date.now()-i<=e;)await new Promise(s=>setTimeout(s,200))}async initialize(){try{await this.waitForClerk();let i=window.Clerk;if(i&&typeof i=="function")this.clerk=i({publishableKey:l,isSatellite:!0,domain:a,signInUrl:`${r}/sign-in`,signUpUrl:`${r}/sign-up`}),await this.clerk.load();else if(i&&typeof i.load=="function")this.clerk=i,await this.clerk.load({publishableKey:l,fallbackRedirectUrl:`https://${a}`,isSatellite:!0,domain:a,signInUrl:`${r}/sign-in`,signUpUrl:`${r}/sign-up`});else throw new Error("Clerk not properly loaded");return this.initialized=!0,!0}catch{return!1}}async ready(){await this.initPromise}async getUser(){return await this.ready(),this.clerk?.user??null}async getUserEmail(){return(await this.getUser())?.primaryEmailAddress?.emailAddress??null}async isAuthenticated(){return!!await this.getUser()}async signIn(e=`https://${a}`){if(await this.ready(),!!this.clerk)try{await this.clerk.openSignIn?.({fallbackRedirectUrl:e,forceRedirectUrl:e})}catch{window.location.href=`${r}/sign-in?__clerk_redirect_url=${encodeURIComponent(e)}`}}async signUp(e=`https://${a}`){if(await this.ready(),!!this.clerk)try{await this.clerk.openSignUp?.({fallbackRedirectUrl:e,forceRedirectUrl:e})}catch{window.location.href=`${r}/sign-up?__clerk_redirect_url=${encodeURIComponent(e)}`}}async signOut(){await this.ready(),await this.clerk?.signOut?.(),window.location.href=r}};var o=class{constructor(e){this.dealershipUrl=e;this.isLoading=!1}render(){return`
      <div class="upgrade-prompt" data-upgrade>
        <div class="upgrade-prompt-header">
          <h2>Upgrade to Pro</h2>
          <p>Unlock advanced features and insights</p>
        </div>
        <div class="upgrade-prompt-body">
          <ul class="feature-list">
            <li>Unlimited dealerships</li>
            <li>Advanced analytics</li>
            <li>Priority support</li>
            <li>Custom integrations</li>
          </ul>
        </div>
        <div class="upgrade-prompt-footer">
          <button class="btn-upgrade" onclick="window.upgradePrompt?.startCheckout()">
            Start Free Trial
          </button>
        </div>
      </div>
    `}async startCheckout(){if(!this.isLoading){this.isLoading=!0;try{localStorage.setItem("pendingCheckout",JSON.stringify({timestamp:Date.now(),dealershipUrl:this.dealershipUrl})),window.location.href=`${this.dealershipUrl}?startTrial=true`}catch(e){console.error("Checkout failed:",e)}finally{this.isLoading=!1}}}};var c=typeof process<"u"&&!0,d={debug:(...t)=>{c||console.debug(...t)},info:(...t)=>{c||console.info(...t)},warn:(...t)=>console.warn(...t),error:(...t)=>console.error(...t)};var y=new n;window.addEventListener("DOMContentLoaded",async()=>{if(new URLSearchParams(window.location.search).get("startTrial")==="true")try{let e=localStorage.getItem("pendingCheckout");if(e){let i=JSON.parse(e);Date.now()-i.timestamp<600*1e3&&(localStorage.removeItem("pendingCheckout"),await new Promise(p=>setTimeout(p,1e3)),window.upgradePrompt&&await window.upgradePrompt.startCheckout())}history.replaceState({},document.title,location.pathname)}catch(e){d.error("resume checkout failed",e)}});window.upgradePrompt=new o(location.href);export{y as auth,d as logger};
