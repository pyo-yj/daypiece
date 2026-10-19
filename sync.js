/* Firebase is entirely optional. No Firebase APIs run until the user presses the connect button. */
let lib, app, auth, db, user, docRef, unsub, queued, timer;
async function getLib(){if(lib)return lib;const [a,b,c]=await Promise.all([
import('https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js'),
import('https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js'),
import('https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js')]);lib={a,b,c};return lib}
function mergeData(local,remote){if(!remote||remote.version!==2)return local;const copy=JSON.parse(JSON.stringify(local));copy.days={...remote.days,...copy.days};for(const[k,v]of Object.entries(remote.days||{})){const own=local.days?.[k];if(!own||(v.updatedAt||0)>(own.updatedAt||0))copy.days[k]=v}
if((remote.routinesUpdatedAt||0)>(local.routinesUpdatedAt||0)){copy.routines=remote.routines;copy.routinesUpdatedAt=remote.routinesUpdatedAt}if((remote.settingsUpdatedAt||0)>(local.settingsUpdatedAt||0)){copy.settings={...local.settings,...remote.settings,firebaseConfig:local.settings.firebaseConfig};copy.settingsUpdatedAt=remote.settingsUpdatedAt}return copy}
async function connect(config,email,password,mode='login'){
 const {a,b,c}=await getLib();
 if(app&&app.options.projectId!==config.projectId)throw Error('이미 다른 프로젝트에 연결되어 있어. 새로고침 후 다시 시도해 줘.');
 app=app||a.initializeApp(config);auth=b.getAuth(app);db=c.getFirestore(app);
 const creds=mode==='register'?await b.createUserWithEmailAndPassword(auth,email,password):await b.signInWithEmailAndPassword(auth,email,password);
 user=creds.user;docRef=c.doc(db,'users',user.uid,'app','main');
 if(unsub){unsub();unsub=null}
 const snapshot=await c.getDoc(docRef);const local=window.appGetState();
 if(snapshot.exists()){
   const remote=snapshot.data().state;
   const merged=mergeData(local,remote);
   window.appImportCloud(merged);
   if(JSON.stringify(merged.days)!==JSON.stringify(remote?.days)||JSON.stringify(merged.routines)!==JSON.stringify(remote?.routines))await c.setDoc(docRef,{state:merged,updatedAt:c.serverTimestamp()},{merge:true});
 }else{await c.setDoc(docRef,{state:local,updatedAt:c.serverTimestamp()})}
 unsub=c.onSnapshot(docRef,snap=>{
   const remote=snap.data()?.state;
   if(!remote)return;
   window.appImportCloud(remote)
 },err=>window.appCloudStatus('동기화 오류: '+err.message,false));
 window.appCloudStatus('연결됨 · '+user.email,true);
}
function save(data){if(!user||!db||!docRef)return;queued=JSON.parse(JSON.stringify(data));clearTimeout(timer);timer=setTimeout(async()=>{try{await lib.c.setDoc(docRef,{state:queued,updatedAt:lib.c.serverTimestamp()})}catch(e){window.appCloudStatus('저장 실패 · 로컬은 저장됨',false)}},900)}
async function logout(){clearTimeout(timer);if(unsub){unsub();unsub=null}if(auth)await lib.b.signOut(auth);user=null;docRef=null;window.appCloudStatus('연동 안 됨',false)}
window.CloudSync={connect,save,logout};
