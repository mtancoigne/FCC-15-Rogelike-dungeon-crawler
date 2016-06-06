import React from 'react';
import {render} from 'react-dom';

import PlayerStats from './PlayerStats.jsx';
import MapInfos from './MapInfos.jsx';
import EnemyInfos from './EnemyInfos.jsx';
import QuestLog from './QuestLog.jsx';
import Grid from './Grid.jsx';

import MapGen from './data/MapGen.jsx';

class App extends React.Component{
  render(){
    return(
      <div>
        <MapInfos />
        <div id="main">
          <div id="menu">
            <PlayerStats
              name={this.state.items['player'].name}
              description={this.state.items['player'].description}
              link={this.state.items['player'].link}
              level={this.state.items['player'].stats.level}
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
        </div>
      </div>
    );
  }

  constructor(props){
    super(props);

    var map=new MapGen;
    map.init(this.props.options)
    map.createMap();

    map.createRooms();
    map.removeSmallRooms(300);

    var walkableCells=map._getWalkableCells(false);
    var walkableSafeCells=map._getWalkableCells(true);

    map.addItems({
      player: Object.assign({}, DEFAULT_ITEM, {
        name:'Leukocyt',
        description: 'You, a white globule',
        canMove:true,
        stats: Object.assign({}, DEFAULT_STATS, this._levelStats(1)),
        className:'player'
      })
    }, true);

    var playerStats=DEFAULT_PLAYER_STATS;//map.items.player.stats;

    // Creating enemies
    var enemies=new Object(this._createEnemies('enemy', playerStats, walkableSafeCells.length, 2));
    var boss=new Object(this._createBoss(playerStats, 1));
    map.addItems(enemies, true);
    map.addItems(boss, true);

    // Creating items
    for(let i in ITEMS){
      if(ITEMS[i].type=='item'){
        let items=this._createItems(i, walkableSafeCells.length, 2);
        map.addItems(items, true);
      }
    }

    this.state={
      cells:map.cells,
      items:map.items,
      grid:map.grid,
      vp:[],
      messages:[],
      currentEnemy:null,
      gameOver:false,
    }
    this.state.cells=this._discoverAroundPlayer(false);

    this.state.vp=this._viewportGrid();
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

  _createBoss(basePlayerStats, number){
    var bosses={};
    var bossStats={};
    for (let i=0; i<number; i++){
      let boss=BOSS_NAMES[Math.floor(Math.random()*BOSS_NAMES.length)];

      bossStats=this._levelStats(basePlayerStats.level+5);

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
    console.log('Created '+ number+ ' bosses');
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

  _createEnemies(type, basePlayerStats, walkableCells, enemiesPercent, number){
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
        enemyStats=this._levelStats(basePlayerStats.level);
      }else if (randomGen<80) {
        enemyStats=this._levelStats(basePlayerStats.level+1);
      }else if(randomGen<95) {
        enemyStats=this._levelStats(basePlayerStats.level+2);
      }else{
        enemyStats=this._levelStats(basePlayerStats.level+3);
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

    console.log("Created "+nb+' "'+type+'"')
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
        console.log(name);
      }
      console.log('Created '+nb+' "'+name+'"');
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
          //console.log(this.state.items[i])
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
        var items=this.state.items;
        items.player.position=nextPos;
        this.setState({items:items});
        //this.setState({map.items.player.position:newPos});
        //this._conslog('info', 'You move from '+playerPos+' to ' + nextPos);
        this._discoverAroundPlayer(true);
        var life=this._doDamages(this.state.cells[nextPos].type.damage, 'player');
        if(life==0){
          this._gameOver('You died, burnt by hot lava.');
        }
        this.setState({vp:this._viewportGrid()});
      }
    }else{
      console.log('Player can\'t go here.');
    }
  }

  _gameOver(msg){
    this.setState({gameOver:true});
    this._conslog('fatal', msg);
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
        var pos=items[target].position.split(':');
        $('#target-'+(target=='player'?'player':'enemy')).fadeTo(100, 0.5).fadeTo(100,1);
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
          this.setState({currentEnemy:null});
          this.setState({items:items});
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
    //console.log(position);
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
}


/*******************************************************************************

GAME CONSTANTS FOR INITIAL generation

*/
const DEFAULT_PLAYER_STATS={life:50, totalLife:50, damage:10, strength:1, armor:1, level:1, celerity:1};

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
};

// Some bosses :
const BOSS_NAMES=[
  {name:'Acará virus', description:'The Acará virus (ACAV) is a possible species in the genus Bunyavirus, belonging to the Capim serogroup. It is isolated from sentinel mice, Culex species, and the rodent Nectomys squamipes in Para, Brazil and in Panama. The symptoms of the Acará virus is death. Sometimes reported to cause disease in humans.', more:'https://en.wikipedia.org/wiki/Acar%C3%A1_virus'},
  {name:'Banana virus X', description:'Cafeteria roenbergensis virus (CroV) is a giant virus that infects the marine bicosoecid flagellate Cafeteria roenbergensis. CroV has one of the largest genomes of all marine virus known, consisting of ~730,000 base pairs of double-stranded DNA', more:'https://en.wikipedia.org/wiki/Cafeteria_roenbergensis_virus'},
  {name:'Mokola virus', description:'Mokola virus (MOKV) is a RNA virus related to the Rabies virus that has been sporadically isolated from mammals across sub-Saharan Africa. The majority of isolates have come from domestic cats exhibiting symptoms characteristically associated to Rabies virus infection.', more:'https://en.wikipedia.org/wiki/Mokola_virus'},
  {name:'Nipah Virus', description:'Nipah virus was identified in April 1999, when it caused an outbreak of neurological and respiratory disease on pig farms in peninsular Malaysia, resulting in 257 human cases, including 105 human deaths and the culling of one million pigs.', more:'https://en.wikipedia.org/wiki/Henipavirus#Nipah_virus'},
];

// Some enemies : bacterias and fungis
const ENEMY_NAMES=[
  // Lazy me... http://alltoptens.com/top-ten-most-dangerous-bacteria-on-earth/
  // This list was completed with wikipedia articles and some names has been changed or removed when info wasn't clear enough.
  {name:'Escherichia coli', description:'Virulent strains can cause gastroenteritis, urinary tract infections, and neonatal meningitis. It can also be characterized by severe abdominal cramps, diarrhea that typically turns bloody within 24 hours, and sometimes fever.', more:'https://en.wikipedia.org/wiki/Escherichia_coli'},
  {name:'Clostridium Botulinum', description:'Infection with the bacterium may result in a potentially fatal disease called botulism. Botulinum is the most acutely lethal toxin known, with an estimated human median lethal dose (LD50) of 1.3–2.1 ng/kg intravenously or intramuscularly and 10–13 ng/kg when inhaled.', more:'https://en.wikipedia.org/wiki/Botulinum_toxin'},
  {name:'Salmonella', description:'Strains of Salmonella cause illnesses such as typhoid fever, paratyphoid fever, and food poisoning (salmonellosis).', more:'https://en.wikipedia.org/wiki/Salmonella'},
  {name:'Vibrio cholera', description:'Cholera affects an estimated 3–5 million people worldwide and causes 58,000–130,000 deaths a year as of 2010.While it is currently classified as a pandemic, it is rare in the developed world. Children are mostly affected.', more:'https://en.wikipedia.org/wiki/Cholera'},
  {name:'Clostridium tetani', description:'Tetanus toxin is a potent neurotoxin. On the basis of weight, tetanospasmin is one of the most potent toxins known (based on tests conducted on mice). The estimated minimum human lethal dose is 2.5 nanograms per kilogram of body weight, or 175 nanograms in a 70 kg (154 lb) human.', more:'https://en.wikipedia.org/wiki/Clostridium_tetani'},
  {name:'Aspergillus fumigatus', description:'An ubiquitous organism that is capable of living under extensive environmental stress. It is estimated that most humans inhale thousands of Aspergillus spores daily, but they do not affect most people’s health due to effective immune responses. Taken together, the major chronic, invasive and allergic forms of aspergillosis account for around 600,000 deaths annually worldwide.', more:'https://en.wikipedia.org/wiki/Aspergillosis'},
  {name:'Treponema pallidum', description:'Treponema pallidum is a spirochaete bacterium with subspecies that cause treponemal diseases such as syphilis, bejel, pinta, and yaws. The treponemes have a cytoplasmic and an outer membrane. Using light microscopy, treponemes are only visible using dark field illumination.', more:'https://en.wikipedia.org/wiki/Treponema_pallidum'},
  {name:'Streptococcus', description:'In addition to streptococcal pharyngitis (strep throat), certain Streptococcus species are responsible for many cases of pink eye, meningitis, bacterial pneumonia, endocarditis, erysipelas, and necrotizing fasciitis (the \'flesh-eating\' bacterial infections).', more:'https://en.wikipedia.org/wiki/Streptococcus'},
  {name:'Mycobacterium tuberculosis', description:'Tuberculosis generally affects the lungs, but can also affect other parts of the body. Most infections do not have symptoms, known as latent tuberculosis. About 10% of latent infections progress to active disease which, if left untreated, kills about half of those infected.', more:'https://en.wikipedia.org/wiki/Tuberculosis'},
];
const MAP_OPTIONS={x:5, y:5, passes:3, cleanLevel:5, wallPercent:10, sameSubCellPercent:80, cssPrefix:'map-', cellTypes:CELL_TYPES};

var appRendered=render(<App options={MAP_OPTIONS} vpSize='15'/>, document.getElementById('app'));

$(document).keyup(function(e) {
  if([37,38,39,40].indexOf(e.keyCode)>-1){
    appRendered._move(e.keyCode);
    var element = document.getElementById("questLog");
    element.scrollTop = element.scrollHeight;
  }
});
