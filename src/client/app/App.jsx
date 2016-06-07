import React from 'react';
import {render} from 'react-dom';

import PlayerStats from './PlayerStats.jsx';
import MapInfos from './MapInfos.jsx';
import EnemyInfos from './EnemyInfos.jsx';
import QuestLog from './QuestLog.jsx';
import Grid from './Grid.jsx';
import Reset from './Reset.jsx';

import MapGen from './data/MapGen.jsx';

class App extends React.Component{
  render(){
    if(this.state.loading){
      return (<div id="loading"></div>);
    }else{
      return(
        <div>
          <MapInfos items={this._countItems()} orig={this.state.startItems}/>
          <div id="main">
            <div id="menu">
              <PlayerStats
                name={this.state.items['player'].name}
                description={this.state.items['player'].description}
                link={this.state.items['player'].link}
                level={this.state.items['player'].stats.experience!=null?this._determineLevel(this.state.items['player'].stats.experience):''}
                life={this.state.items['player'].stats.life}
                totalLife={this.state.items['player'].stats.totalLife}
                experience={this.state.items['player'].stats.experience}
                damage={this.state.items['player'].stats.damage}
                strength={this.state.items['player'].stats.strength}
                armor={this.state.items['player'].stats.armor}
                celerity={this.state.items['player'].stats.celerity}
                />
              <EnemyInfos
                level={this.state.currentEnemy!=null?this._determineLevel(this.state.items[this.state.currentEnemy].stats.experience):null}
                name={this.state.currentEnemy!=null?this.state.items[this.state.currentEnemy].name:null}
                description={this.state.currentEnemy!=null?this.state.items[this.state.currentEnemy].description:null}
                link={this.state.currentEnemy!=null?this.state.items[this.state.currentEnemy].more:null}
                stats={this.state.currentEnemy!=null?this.state.items[this.state.currentEnemy].stats:null}
                className={this.state.currentEnemy!=null?this.state.items[this.state.currentEnemy].className:null}
                />
            </div>
            <div id="game">
              <Grid
                gridWidth={this.state.grid[0].length}
                gridHeight={this.state.grid[1].length}
                grid={this.state.vp}
                cells={this.state.cells}
                items={this.state.items}
              />
            </div>
            <div>
              <QuestLog messages={this.state.messages}/>
            </div>
            <div>
              <Reset gameOver={this.state.gameOver} reset={this._reset} message={this.state.endGameMessage}/>
            </div>
          </div>
        </div>
      );
    }
  }

  constructor(props){
    super(props);

    this.state=this._generate();
    // Calculates cells around the player
    this.state.cells=this._discoverAroundPlayer(false);
    // Calculates the content of the viewport
    this.state.vp=this._viewportGrid();
    // Count the items
    this.state.startItems=this._countItems();
    this.state.loading=false;

    this._reset=this._reset.bind(this);

  }

  _generate(){
    var map=new MapGen;
    map.init(this.props.options)
    map.createMap();
    map.createRooms();
    map.removeSmallRooms(300);

    // This will be the initial state.
    var obj={
      messages:[],
      vp:[],
      startItems:[],
      currentEnemy:null,
      gameOver:false,
      floorNb:-1
    };

    var player={};
    if(this.props.playerStats){
      player=this.props.playerStats;
    }else{
      player=Object.assign({}, DEFAULT_ITEM, {
        name:'John',
        description: 'You, with your funny hat of destruction.',
        canMove:true,
        className:'player',
        stats: Object.assign({}, DEFAULT_STATS, this._levelStats(1)),
      })
    }

    map.addItems({player: player}, true);

    var walkableCells=map._getWalkableCells(false);
    var walkableSafeCells=map._getWalkableCells(true);

    var playerLevel=player.stats.level;
    // Creating enemies
    var enemies=new Object(this._createEnemies('enemy', playerLevel, walkableSafeCells.length, 2));
    var boss=new Object(this._createBoss(playerLevel, 1));
    map.addItems(enemies, true);
    map.addItems(boss, true);

    // Creating items
    for(let i in ITEMS){
      if(ITEMS[i].type=='item'){
        let items=this._createItems(i, walkableSafeCells.length, 2);
        map.addItems(items, true);
      }
    }

    obj.grid=map.grid;
    obj.cells= map.cells;
    obj.items=map.items;
    return obj;
  }

  _reset(){
    this.setState({loading:true});
    // Destroy
    this.state.cells={};
    this.state.items={};
    this.state.startItems=[];
    this.state.vp=[];
    this.state.grid=[];
    this.forceUpdate();
    // Waiting for the state to be propagated
    this.setState(this._generate());

    // That's weird, that's the only way I found to execute the following code...
    // As if there was a delay with setState... But it works with a timer of 0...
    var timer=setInterval(()=>{
        this._discoverAroundPlayer(true);
        this.setState({gameOver:false, startItems:this._countItems(), vp:this._viewportGrid()});
        this.setState({loading:false});
        clearInterval(timer);
    }, 0);
  }

  _viewportGrid(){
    var pos=this.state.items.player.position.split(':');
    var posX=pos[0]-Math.floor((this.props.vpSize-1)/2);
    var posY=pos[1]-Math.floor((this.props.vpSize-1)/2);
    var vp=[];
    if(posX < 0){posX=0};
    if(posX > this.state.grid[0].length - this.props.vpSize){
      posX = this.state.grid[0].length - this.props.vpSize
    };
    if(posY < 0){posY=0};
    if(posY > this.state.grid.length - this.props.vpSize){
      posY = this.state.grid.length - this.props.vpSize;
    }
    for(let y=0; y<this.props.vpSize; y++){
      var row=[];
      for(let x=0; x<this.props.vpSize; x++){
        let nPos=(x+posX)+':'+(y+posY);
        let nY
        row[x+posX]=(this.state.grid[y+posY][x+posX]);
      }
      vp[String(y+posY)]=row;
    }
    return vp;
  }

  _createBoss(playerLevel, number){
    var bosses={};
    var bossStats={};
    for (let i=0; i<number; i++){
      let boss=BOSS_NAMES[Math.floor(Math.random()*BOSS_NAMES.length)];

      bossStats=this._levelStats(playerLevel+5);

      bosses['boss_'+i]=Object.assign({}, DEFAULT_ITEM, {
        name:boss.name,
        description:boss.description,
        more:boss.more,
        canMove:true,
        stats: Object.assign({}, DEFAULT_STATS, bossStats),
        className: 'boss',
        type:'hostile',
      })
    }
    //this._conslog('system','Created '+ number+ ' bosses');
    return bosses;
  }

  _levelStats(level){
    var stats={}
    // Base life:
    var life=         50+(level*50);
    var damage=       9+level;
    var strength=     1+level;
    var armor=        1+level;
    var experience=(level===1)?0:level*10;
    var giveXp=       10*level;
    var celerity=     1+level;
    return {
      life:life,
      totalLife:life,
      damage:damage,
      strength:strength,
      armor:armor,
      experience:experience,
      giveXp:giveXp,
      celerity:celerity,
    };
  }

  _determineLevel(experience){
    return(Math.floor(experience/10)+1);
  }

  _createEnemies(type, playerLevel, walkableCells, enemiesPercent, number){
    // Number of enemies to generate:
    var nb=(number!=undefined)?number:Math.floor(enemiesPercent*walkableCells/100);

    // Create enemies
    var enemies=[];
    for(let i=0; i<nb; i++){
      // Select random enemy
      let enemy=ENEMY_NAMES[Math.floor(Math.random()*ENEMY_NAMES.length)];
      let enemyStats={};
      // Generate random states
      var randomGen=Math.floor(Math.random()*101);
      if(randomGen<80){
        enemyStats=this._levelStats(playerLevel);
      }else if (randomGen<80) {
        enemyStats=this._levelStats(playerLevel+1);
      }else if(randomGen<95) {
        enemyStats=this._levelStats(playerLevel+2);
      }else{
        enemyStats=this._levelStats(playerLevel+3);
      }
      enemies[type+'_'+i]=Object.assign({}, DEFAULT_ITEM, {
        name:enemy.name,
        description:enemy.description,
        more:enemy.more,
        canMove:true,
        stats: Object.assign({}, DEFAULT_STATS, enemyStats),
        className: type,
        type:'hostile',
      });
    }

    //this._conslog('system', "Created "+nb+' "'+type+'"')
    return enemies;
  }

  _createItems(name, walkableCells, percent, number){
      var nb=0;
      var items={};
      if(number!=undefined){
        nb=number
      }else{
        nb=Math.floor((walkableCells*Math.random()*percent)/100)
      }
      for(let i=0; i<nb; i++){
        items[name+'_'+i]=Object.assign({}, DEFAULT_ITEM, ITEMS[name]);
      }
      //this._conslog('system', 'Created '+nb+' "'+name+'"');
      return items;
  }

  _move(keyCode){
    if(this.state.gameOver){return false}
    var playerPos=this.state.items.player.position.split(':')
    var playerX=Number(playerPos[0]);
    var playerY=Number(playerPos[1]);
    var nextX=playerX;
    var nextY=playerY;

    switch(keyCode){
      case 38: // Up
        nextY--;
        break;
      case 39: // Right
        nextX++;
        break;
      case 40: // Down
        nextY++;
        break;
      case 37:
        nextX--;
        break;
    }
    var nextPos=nextX+':'+nextY;
    // Check if cell is walkable

    if(this.state.cells[nextPos].type.isWalkable===true){
      // Check cell content: if enemy stick to it
      var preventMove=false;
      for(let i in this.state.items){
        if(this.state.items[i].position===nextPos && i!='player'){
          if(this.state.items[i].type==='hostile'){
            preventMove=true;
            this._combat(i);
          }else if(this.state.items[i].type==='item'){
            var items=this.state.items;
            this._conslog('info', 'You picked up a '+items[i].name);
            switch (items[i].effect) {
              case '_potion_life':
                this._potion_life();
                break;
              case '_token_armor':
                this._token_armor();
                break;
              case '_token_damage':
                this._token_damage();
                break
              case '_token_strength':
                this._token_strength();
                break;
              case '_token_celerity':
                this._token_celerity();
                break;
              default:
                this._conslog('fatal', 'Unknown item...');
            }
            delete items[i];
            this.setState({items:items});
          }else{
            this._conslog('info', 'You walked on '+this.state.items[i].name);
          }
        }
      }
      if(!preventMove){
        if(this.state.currentEnemy!=null){
          this.setState({currentEnemy:null});
        }
        var items=this.state.items;
        items.player.position=nextPos;
        this.setState({items:items});
        this._discoverAroundPlayer(true);
        var life=this._doDamages(this.state.cells[nextPos].type.damage, 'player');
        if(life==0){
          this._gameOver('You died, burnt by hot lava.');
        }
        this.setState({vp:this._viewportGrid()});
      }
    }
    // Move ennemies
    var items=this.state.items;
    for(let i in this.state.items){
      if(this.state.items[i].canMove && i!=this.state.currentEnemy && i!='player'){
        var pos=this.state.items[i].position.split(':')
        var possibilities=this._getWalkableCellsAround(pos[0],pos[1], null, null, items, true);
        //console.log(possibilities);
        if(possibilities.length>0){
          var newPos=possibilities[Math.floor(Math.random()*possibilities.length)];
          items[i].position=newPos[0]+':'+newPos[1];
        }
      }
    }
    this.setState({items:items});
  }

  _getWalkableCellsAround(x,y, grid, cells, items, stillIfPlayer){
    x=Number(x);
    y=Number(y);
    // Don't move if the player is around.
    if(!stillIfPlayer){
      stillIfPlayer=false;
    }
    if(!grid){
      grid=this.state.grid;
    }
    if(!cells){
      cells=this.state.cells;
    }
    if(!items){
      items=this.state.items;
    }
    var inside=[ [x-1, y], [x+1, y], [x, y-1], [x, y+1] ];
    var results=[];
    // Looking around
    for(let i in inside){
      let newX=inside[i][0];
      let newY=inside[i][1];
      if(newX>=0 && newY>=0 && newX<grid[0].length && newY<grid.length){
        if(cells[newX+':'+newY].type.isWalkable === true && cells[newX+':'+newY].type.damage<=0){
          var nb=0;
          for(let j in items){
            if(items[j].position==newX+':'+newY){
              nb++;
              if(j == 'player' && stillIfPlayer){
                // don't Move
                return [];
              }
            }
          }
          if(nb==0){
            results.push(inside[i]);
          }
        }
      }
    }
    return results;
  }

  _gameOver(msg){
    this.setState({gameOver:true, endGameMessage:msg});
    this.conslog('system', '---');
    this._conslog('fatal', msg);
  }

  _countItems(){
    var out=[]
    for(let i in this.state.items){
      if(out[this.state.items[i].className]==undefined){
        out[this.state.items[i].className]=0;
      }
      out[this.state.items[i].className]++;
    }
    return out;
  }

  _combat(target){
    var pl=this.state.items.player;
    var tg=this.state.items[target];

    // Define who engage first
    var playerFirst=(pl.stats.celerity>pl.stats.celerity);

    // Lock the enemy
    this.setState({currentEnemy:target});

    // Log
    this._conslog((playerFirst?'info':'danger'), '---');
    this._conslog('danger', 'You engaged with a...');
    this._conslog('danger', '  - level '+this._determineLevel(this.state.items[target].stats.experience)+' '+this.state.items[target].name);
    this._conslog((!playerFirst?'info':'danger'), (playerFirst?'You':'The enemy')+' attacked first');

    // Do the damages
    var isDead=this._doAttack(playerFirst?'player':target, playerFirst?target:'player');

    // Check death
    if(!isDead){
      playerFirst=!playerFirst;
      this._conslog((playerFirst?'info':'danger'), (playerFirst?'You':'The enemy')+' fought back !');
      isDead=this._doAttack(playerFirst?'player':target, playerFirst?target:'player');
    }
  }

  _doDamages(damage, target){
    if(damage>0){
      var items=this.state.items;

      // Eyecandy efect on target
      if(target=='player' || target==this.state.currentEnemy){
        //var pos=items[target].position.split(':');

        var div='#target-'+(target=='player'?'player':'enemy');
        $(div).css('backgroundColor', 'rgba(200, 0, 0,0.5)');
        var interval=setInterval(function () {
          $(div).css('backgroundColor', 'rgb(234, 234, 234)');
          clearInterval(interval);
        }, 200);
        $(div).fadeTo(100, 0.5).fadeTo(100,1);
      }

      // Remove life
      items[target].stats.life=items[target].stats.life-damage;

      // Check state
      if(items[target].stats.life <= 0){
        // Copy position
        let pPos=items[target].position;
        // Nice tomb
        items[target]=Object.assign({}, DEFAULT_ITEM, ITEMS[target!='player'?'tomb_stone':'tomb_stone_player']);
        // Re-set position
        items[target].position=pPos;
      }
      this.setState({items:items});
    }
    return this.state.items[target].stats.life;
  }

  _doAttack(attacker, target){
    // Copy some values:
    var tName=this.state.items[target].name;
    var tXp=this.state.items[target].stats.giveXp;


    // Flag to know if the target is dead
    var dead=false;
    // See if the attacker is the player
    var playerFirst=(attacker=="player");

    // Calculates the damages
    var dmg=this._calcDamages(attacker, target);
    // Get the new life from state
    var currentLife=this.state.items[target].life;

    // Log action and result
    if( dmg > 0){
      this._conslog((playerFirst?'info':'danger'),'...and did '+dmg+' damage !');

      // Apply damages
      currentLife=this._doDamages(dmg, target);

      //Check results
      if(currentLife<=0){
        this._conslog(playerFirst?'success':'fatal', (!playerFirst? 'You': tName) +' died');
        if(playerFirst){
          // Get a fresh list of items
          var items=this.state.items;
          // Add experience to player
          items['player'].stats.experience+=tXp;
          // Update the state
          this.setState({items:items, currentEnemy:null});
        }else{
          this._gameOver('You have been defeated.');
        }
        return true
      }
    }else{
      this._conslog((playerFirst?'danger':'info'),'...but failed. !');
    }
    return false;
  }

  _calcDamages(first, second){
    var f=this.state.items[first].stats;
    var s=this.state.items[second].stats;
    // Calculates the damage
    return Math.ceil(((10+f.strength)/10)*f.damage-s.armor);
  }

  _conslog(type, message){
    var messages=this.state.messages
    if(message=='---'){
      messages.push({id:messages.length, type:'hr', message:'::--::--::'});
    }else{
      messages.push({id:messages.length, type:type, message:message});
    }
    this.setState({messages:messages});
  }

  _discoverAroundPlayer(updateState){
    var position=this.state.items.player.position;
    var playerPos=position.split(':')
    var playerX=Number(playerPos[0]);
    var playerY=Number(playerPos[1]);
    var mapWidth=this.state.grid[0].length;
    var mapHeight=this.state.grid.length;
    var cellCopy=this.state.cells;

    var matrix=[
                    [-1,-3], [ 0,-3], [ 1,-3],
           [-2,-2], [-1,-2], [ 0,-2], [ 1,-2], [ 2,-2],
  [-3,-1], [-2,-1], [-1,-1], [ 0,-1], [ 1,-1], [ 2,-1], [ 3,-1],
  [-3, 0], [-2, 0], [-1, 0], [ 0, 0], [ 1, 0], [ 2, 0], [ 3, 0],
  [-3, 1], [-2, 1], [-1, 1], [ 0, 1], [ 1, 1], [ 2, 1], [ 3, 1],
           [-2, 2], [-1, 2], [ 0, 2], [ 1, 2], [ 2, 2],
                    [-1, 3], [ 0, 3], [ 1, 3]
                  ];
    for(let i=0; i<matrix.length; i++){
      let newX=playerX+matrix[i][0];
      let newY=playerY+matrix[i][1];
      if(newX>=0 && newX<=mapWidth-1 && newY>=0 && newY<=mapHeight-1){
        cellCopy[newX+':'+newY].discovered=true;
      }
    }
    if(updateState===true){
      this.setState({cells:cellCopy});
    }else{
      return cellCopy;
    }
  }

  _potion_life(){
    var quantity=50;
    var items=this.state.items;
    items['player'].stats.life=(items['player'].stats.life+quantity>items['player'].stats.totalLife?items['player'].stats.totalLife:items['player'].stats.life+quantity);
    this.setState({items:items});
  }
  _token_armor(){
    var items=this.state.items;
    items['player'].stats.armor+=1;
    this.setState({items:items});
  }
  _token_damage(){
    var items=this.state.items;
    items['player'].stats.damage+=1;
    this.setState({items:items});
  }
  _token_strength(){
    var items=this.state.items;
    items['player'].stats.strength+=1;
    this.setState({items:items});
  }
  _token_celerity(){
    var items=this.state.items;
    items['player'].stats.celerity+=1;
    this.setState({items:items});
  }
}


/*******************************************************************************

GAME CONSTANTS FOR INITIAL generation

*/
const DEFAULT_PLAYER_STATS={life:50, totalLife:50, damage:10, strength:1, armor:1, level:1, celerity:1, experience:0,};

const DEFAULT_ITEM={
  name:'NO NAME',
  description: 'NO DESCRIPTION',
  type:null,
  canMove:false,
  storable: false,
  consumable: false,
  position:null,
  effect:null,
  inventory:[],
  stats:{},
  className:'item',
};

const DEFAULT_STATS={life:-1, totalLife:0, damage:0, strength:0, armor:0, level:1, experience:0, giveXp:0, celerity:1};

const CELL_TYPES={
  wall:    {name:'wall',   isWalkable:false, classNames:['wall'],  discovered:false, isBaseCell:true},
  floor:   {name:'floor',  isWalkable:true,  classNames:['floor'], discovered:false, isBaseCell:true},
  lava:    {name:'lava',   isWalkable:true,  classNames:['lava'],  discovered:false, damage:1},
  water:   {name:'water',  isWalkable:true,  classNames:['water'], discovered:false},
};

const ITEMS={
  tomb_stone:        {name:'Remains',           description: 'A dead enemy',                    type:'special', storable:false, consumable:false, className:'tomb', stats:{life:0}},
  tomb_stone_player: {name:'You',               description: 'Diseases took your life away...', type:'special', storable:false, consumable:false, className:'tomb-player', stats:{life:0}},
  life_potion:       {name:'Life potion',       description: 'Gives you 50 points of life',     type:'item',    storable:false, consumable:true,  className:'health', effect:'_potion_life'},
  token_strength:    {name:'Token of strength', description: 'Adds 1 to your strength',         type:'item',    storable:true,  consumable:false, className:'chest',  effect:'_token_strength'},
  token_damage:      {name:'Token of damage',   description: 'Adds 1 to your damage',           type:'item',    storable:true,  consumable:false, className:'chest',  effect:'_token_damage'},
  token_armor:       {name:'Token of armor',    description: 'Adds 1 to your armor',            type:'item',    storable:true,  consumable:false, className:'chest',  effect:'_token_armor'},
  token_celerity:    {name:'Token of celerity', description: 'Adds 1 to your celerity',         type:'item',    storable:true,  consumable:false, className:'chest',  effect:'_token_celerity'},
};

// Some bosses :
const BOSS_NAMES=[
  {name:'Joker', description:'The Joker is a fictional supervillain who appears in American comic books published by DC Comics. The character was created by Jerry Robinson, Bill Finger, and Bob Kane, and first appeared in Batman #1.', more:'http://www.ranker.com/review/joker/2498261?ref=name_320416'},
  {name:'Hannibal Lecter', description:'Dr. Hannibal Lecter is a character in a series of suspense novels by Thomas Harris. Lecter was introduced in the 1981 thriller novel Red Dragon as a forensic psychiatrist and cannibalistic serial killer.', more:'http://www.ranker.com/review/hannibal-lecter/1125580?ref=name_320416'},
  {name:'Jack Torrence', description:'John Daniel "Jack" Torrance is a fictional character in the 1977 novel The Shining by Stephen King.', more:'http://www.ranker.com/review/jack-torrance/1254047?ref=name_320416'},
  {name:'Freddy Kruegger', description:'Fred "Freddy" Krueger is the main antagonist of the A Nightmare on Elm Street film series. He first appeared in Wes Craven\'s A Nightmare on Elm Street as a burnt serial killer who uses a glove armed with razors to kill his victims in their dreams', more:'http://www.ranker.com/review/freddy-krueger/1022376?ref=name_320416'},
];

// Some enemies : bacterias and fungis
const ENEMY_NAMES=[
  // Lazy me... http://alltoptens.com/top-ten-most-dangerous-bacteria-on-earth/
  // This list was completed with wikipedia articles and some names has been changed or removed when info wasn't clear enough.
  {name:'Gloom Lad', description:'I have all the characteristics of a human being: blood, flesh, skin, hair; but not a single, clear, identifiable emotion, except for greed and disgust.', more:null},
  {name:'Killer Woman', description:'I visited your home this morning after you\'d left. I tried to play husband. I tried to taste the life of a simple man. It didn\'t work out, so I took a souvenir... her pretty head.', more:null},
  {name:'Master Man', description:'The point is ladies and gentlemen that greed, for lack of a better word, is good.', more:null},
  {name:'Necrotic Murderer', description:'Human beings are a disease, a cancer of this planet. You\'re a plague and we are the cure.', more:null},
  {name:'Sickness Master', description:'I\'m going to do something now they used to do in Vietnam. It\'s called making a head on a stick.', more:null},
  {name:'Viral Shade', description:'If Mr. McMurphy doesn\'t want to take his medication orally, I\'m sure we can arrange that he can have it some other way. But I don\'t think that he would like it.', more:null},
];
const MAP_OPTIONS={x:5, y:5, passes:3, cleanLevel:5, wallPercent:10, sameSubCellPercent:80, cssPrefix:'map-', cellTypes:CELL_TYPES};

var appRendered=render(<App options={MAP_OPTIONS} startLevel='1' newGame={true} playerStats={null} vpSize='15'/>, document.getElementById('app'));

$(document).keydown(function(e) {
  if([37,38,39,40].indexOf(e.keyCode)>-1){
    e.preventDefault();
    appRendered._move(e.keyCode);
    var element = document.getElementById("questLog");
    element.scrollTop = element.scrollHeight;
    return false;
  }
  return true;
});
