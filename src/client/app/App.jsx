import React from 'react';
import {render} from 'react-dom';

import PlayerStats from './PlayerStats.jsx';
import MapInfos from './MapInfos.jsx';
import EnemyInfos from './EnemyInfos.jsx';
import QuestLog from './QuestLog.jsx';
import Grid from './Grid.jsx';
import Reset from './Reset.jsx';

// import MapGen from './data/MapGen.jsx';

class App extends React.Component{
  render(){
    if(this.state.loading){
      return (
        <div>
          <div class="overlay"></div>
          <div id="loading"></div>
        </div>);
    }else{
      return(
        <div>
          <div className="panel message-info" id="infoMessage">
            <p>
              This "game" is a React Challenge for <a href="http://freecodecamp.com" target="_blank">FreeCodeCamp</a>. You can find the sources on the <a href="https://github.com/mtancoigne/FCC-15-Rogelike-dungeon-crawler"target="_blank">GitHub</a> repository.
              <a href="https://github.com/mtancoigne/FCC-15-Rogelike-dungeon-crawler/issues" target="_blank">Issues and feedback are welcome</a>.
            </p>
            <p>
              As everything is randomly generated, you may have sometimes trouble to win, so watch for the availables chests and lives...<br/>
            </p>
            <p>All code and sprites created by Manuel Tancoigne, code is under the <a href="https://opensource.org/licenses/MIT" target="_blank">MIT license</a> and sprites assigned under a <a href="https://creativecommons.org/licenses/by-nc-sa/3.0/" target="_blank"><img src="http://mirrors.creativecommons.org/presskit/buttons/80x15/png/by-nc-sa.png" height="15px" title="Creative Commons BY-NC-SA license" alt="Creative Commons BY-NC-SA license" /></a></p>
            <button className="btn btn-block btn-blue" onClick={this._hideInfo}>Got it, close this now.</button>
          </div>
          <h1>The Big Crawl</h1>
          <MapInfos
            items={this._countItems()}
            orig={this.state.startItems}
            mapName={this.state.mapName}
          />
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
                level={this.state.currentEnemy!=null?this.state.items[this.state.currentEnemy].stats.level:null}
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

    this._reset=this._reset.bind(this);
  }

  componentWillMount(){
    this._reset();
  }

  /**
   * Generates the map, place the objects,...
   *
   * @param {promise-Callback} cb the callback that handles the promise
   * @return {Promise}  Returns a promise
   */
  _generate(){
    return new Promise((resolve, reject)=>{
      let error=false;
      let map=new MapGen(this.props.options);
      map.createMap();
      map.createRooms();
      map.removeSmallRooms(300);

      let player={};
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

      let walkableCells=map._getWalkableCells(false);
      let walkableSafeCells=map._getWalkableCells(true);

      let playerLevel=player.stats.level;
      // Creating enemies
      let enemies=new Object(this._createEnemies('enemy', playerLevel, walkableSafeCells.length, 2));
      let boss=new Object(this._createBoss(playerLevel, 1));
      map.addItems(enemies, true);
      map.addItems(boss, true);

      // Creating items
      for(let i in ITEMS){
        if(ITEMS[i].type=='item'){
          let items=this._createItems(i, walkableSafeCells.length, 2);
          map.addItems(items, true);
        }
      }

      // Appliying random cell style
      for(let i in map.cells){
        //console.log(map.cells[i].type.classNames.length);
        if(map.cells[i].type.name=='wall'){
          if(Math.random()>0.9){
            map.cells[i].type.classNames.push('wall-'+Math.floor(Math.random()*4));
          }
        }else if(map.cells[i].type.name=='floor'){
          if(Math.random()>0.9){
            map.cells[i].type.classNames.push('floor-'+Math.floor(Math.random()*4));
          }
        }
      }

      // Testing superpowers
      // map.items.player.stats.damage=1000;
      // map.items.player.stats.celerity=1000;
      // map.items.player.stats.life=1;

      resolve ({
        map:map,
        messages:[],
        vp:[],
        startItems:[],
        currentEnemy:null,
        gameOver:false,
        loading:false,
        mapName:this._mapName(),
        grid:map.grid,
        items:map.items,
        cells:this._discoverAroundPlayer(map.items, map.grid, map.cells),
        startItems:this._countItems(map.items),
        vp:this._viewportGrid(map.grid, map.items),
      });
    });
  }

  /**
   * Generates a new map and resets this.state
   */
  _reset(){
    this.setState({loading:true});
    this._generate()
      .then(map => this.setState(map))
      .catch(error => console.error(error));
  }

  /**
   * Generates an array representing the viewport (which portion of the map to be displayed)
   * Use grid and items vars when you generate before the state is set.
   *
   * @param array grid - The grid from MapGen.grid. If null, will use the state grid.
   * @param obj items - The object containing the items. If null, will use state items.
   *
   * @return array - An array similar to MapGen's grid, but smaller.
   */
  _viewportGrid(grid=null, items=null){
    if(!grid){
      grid=this.state.grid;
    }
    if(!items){
      items=this.state.items;
    }
    var pos=items.player.position.split(':');
    var posX=pos[0]-Math.floor((this.props.vpSize-1)/2);
    var posY=pos[1]-Math.floor((this.props.vpSize-1)/2);
    var vp=[];
    if(posX < 0){posX=0};
    if(posX > grid[0].length - this.props.vpSize){
      posX = grid[0].length - this.props.vpSize
    };
    if(posY < 0){posY=0};
    if(posY > grid.length - this.props.vpSize){
      posY = grid.length - this.props.vpSize;
    }
    for(let y=0; y<this.props.vpSize; y++){
      var row=[];
      for(let x=0; x<this.props.vpSize; x++){
        let nPos=(x+posX)+':'+(y+posY);
        let nY
        row[x+posX]=(grid[y+posY][x+posX]);
      }
      vp[String(y+posY)]=row;
    }
    return vp;
  }

  /**
   * Creates a given number of bosses.
   * The bosses level is higher than the playerLevel.
   *
   * @param int playerLevel - Player level to base to boss generation on
   * @param int number - Number of bosses to return;
   *
   * @return an object of items like {boss_1:{boss object}, boss_2:{boss object},...}
  */
  _createBoss(playerLevel, number){
    var bosses={};
    var bossStats={};
    for (let i=0; i<number; i++){
      let boss=BOSSES[Math.floor(Math.random()*BOSSES.length)];

      bossStats=this._levelStats(playerLevel+5);

      bosses['boss_'+i]=Object.assign({}, DEFAULT_ITEM, {
        name:boss.name,
        description:boss.description,
        more:boss.more,
        canMove:true,
        stats: Object.assign({}, DEFAULT_STATS, bossStats),
        className: 'boss',
        type:boss.type,
      })
    }
    //this._conslog('system','Created '+ number+ ' bosses');
    return bosses;
  }

  /**
   * Generates stats for a character of a given level.
   *
   * @param int level - Level you want the char to be.
   *
   * @return {stats} - A stats object
  */
  _levelStats(level){
    var stats={}
    // experience
    var experience=0
    if(level==2){
      experience=20;
    }else if(level>2){
      experience=20
      for(let i=0; i<level; i++){
        experience*=2;
      }
    }
    var life=         50+(level*50);
    var damage=       9+level;
    var strength=     1+level;
    var armor=        1+level;
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

  /**
   * Checks if a character gained a level and apply modifications
   *
   * @param string target - Character to check.
   *
   * @return bool - True if the character gained a level.
   */
  _hasLeveledUp(target){
    let tStats=this.state.items[target].stats;
    // Compare levels
    let theorical=this._determineLevel(tStats.experience);
    if(theorical>tStats.level){
      // Calculates new stats
      let bStats=this._levelStats(tStats.level);
      let nStats=this._levelStats(theorical);
      // Update the stats
      tStats.level=theorical;
      tStats.totalLife=nStats.life;
      tStats.life=nStats.life;
      tStats.damage+=(nStats.damage-bStats.damage)
      tStats.strength+=(nStats.strength-bStats.strength)
      tStats.armor+=(nStats.armor-bStats.armor)
      tStats.celerity+=(nStats.celerity-bStats.celerity)

      let items=this.state.items;
      items[target].stats=tStats;
      this.setState({items:items});
      this._conslog('system', '---');
      this._conslog('success', 'You gained one level !');
      return true;
    }
    return false;
  }

  /**
   * Returns a character's level, given its experience. This is a very basic calculus
   *
   * @param int experience - Actual experience
   *
   * @return int - The character's level
   */
  _determineLevel(experience){
    if(experience < 20){return 1};
    // return 0;
    let level=0;
    let done=false;
    while(!done){
      experience/=2;
      level++;
      done=(experience-10<0);
    }
    return level;
  }
  /**
   * Creates ennemies.
   * Ennemies have a small chance of being of a superior level
   * The number will be a percent of walkable cells on the map
   * The enemy name/description is from the global ENEMY_NAMES array
   *
   * @param string type - prefix for the items array. Can be any string you want.
   * @param int playerLevel - Actual player level for stats generation
   * @param int walkableCells - Number of walkable cells (get it with MapGen.getWalkableCells())
   * @param float enemiesPercent - Percentage of ennemies to create
   * @param int number - Override the percentage calculation and fixes the number to create
   *
   * @return {object} - A list like {type_1:{enemy obj}, type_2;{enemy obj}, ...}
   */
  _createEnemies(type, playerLevel, walkableCells, enemiesPercent, number){
    // Number of enemies to generate:
    var nb=(number!=undefined)?number:Math.floor(enemiesPercent*walkableCells/100);

    // Create enemies
    var enemies=[];
    for(let i=0; i<nb; i++){
      // Select random enemy
      let enemy=ENEMIES[Math.floor(Math.random()*ENEMIES.length)];
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
        type:enemy.type,
      });
    }

    //this._conslog('system', "Created "+nb+' "'+type+'"')
    return enemies;
  }

  /**
   * Creates items.
   * The number will be a percent of walkable cells on the map
   *
   * @param string name - Item name from the ITEMS global array
   * @param int walkableCells - Number of walkable cells (get it with MapGen.getWalkableCells())
   * @param float percent - Percentage of items to create
   * @param int number - Override the percentage calculation and fixes the number to create
   *
   * @return {object} - A list like {name_1:{item obj}, name_2;{item obj}, ...}
   */
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

  /**
   * Handles the player's move, given the key pressed.
   * This function handles the following events:
   *   - Checks if player can go where he want,
   *   - Initiate combat if any
   *   - Handle item picking if any
   *   - Move the enemies
   *   - Update the state for all this.
   *
   * @param int keyCode - Key code
   */
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
          console.log({h:HOSTILES, t: this.state.items[i].type});
          console.log(HOSTILES.indexOf(this.state.items[i].type));
          if(HOSTILES.indexOf(this.state.items[i].type) > -1){
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
        this.setState({items:items, cells:this._discoverAroundPlayer()});
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

  /**
   * Returns cells on which an ennemy can move. Enemies are clever, they won't
   * walk on damaging cells.
   *
   * @param int x - Inital X position
   * @param int y - Initial Y position
   * @param {cells list} cells - Cell list
   * @param {items list} items - Items list
   * @param bool stillIfPlayer - If true, returns an empty array so the enemy
   *                             don't move when the player is near it.
   *
   * @return array - An array of coordinates of empty cells like [[x1, y1], [x2, y2],...]
   */
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

  /**
   * Handles the plaer's death or success
   *
   * @param string msg - Message to display in log an on the gameOver panel.
   */
  _gameOver(msg){
    this.setState({gameOver:true, endGameMessage:msg});
    this._conslog('system', '---');
    this._conslog('fatal', msg);
  }

  /**
   * Counts items of each types and returns an array
   *
   * @param obj items - Items obj from MapGen. If null, will use this.state.items
   *
   * @return array - An array like ["className":number, "otherClassName":nb];
  */
  _countItems(items=null){
    if(!items){items=this.state.items;}
    var out=[]
    for(let i in items){
      if(out[items[i].className]==undefined){
        out[items[i].className]=0;
      }
      out[items[i].className]++;
    }
    return out;
  }

  /**
   * Engage combat with an enemy.
   *   - Calculates who hit first
   *   - hit
   *   - If the other character is still alive, fight back.
   *
   * @param string target - Name of the target, to be found in state.items
   */
  _combat(target){
    var pl=this.state.items.player;
    var tg=this.state.items[target];

    // Define who engage first
    var playerFirst=(pl.stats.celerity>tg.stats.celerity);

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

  /**
   * Actually do damage to a character.
   * - Handles death and state change in the items list
   *
   * @param int damage - Amount of damage
   * @param string target - Name of targeted character in item list
   *
   * @return int - Character's life after taking the damages
   */
  _doDamages(damage, target){
    if(damage>0){
      var items=this.state.items;

      // Eyecandy efect on target
      if(target=='player' || target==this.state.currentEnemy){
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
      console.log('Dealing damages to '+target)
      if(items[target].stats.life <= 0){
        // Copy position
        let pPos=items[target].position;
        // Nice tomb
        var tomb='';
        switch(items[target].type){
          case 'player':
            tomb='tomb_stone_player';
            break;
          case 'enemy':
            tomb='tomb_stone';
            break;
          case 'boss':
            tomb='tomb_stone_boss';
            break;
        }
        items[target]=Object.assign({}, DEFAULT_ITEM, ITEMS[tomb]);
        // Re-set position
        items[target].position=pPos;
      }
      this.setState({items:items});
    }
    return this.state.items[target].stats.life || 0;
  }

  /**
   * Attack a target and manage resulting state:
   *   - Xp gain for player
   *   - Death of player
   *
   * @param string attacker - Attacker identifier in this.state.items
   * @param string target - Target identifier in this.state.items
   *
   * @return bool - True on target's death, otherwise false.
   */
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
      console.log({target:target, life:currentLife});

      //Check results
      if(currentLife<=0){
        this._conslog(playerFirst?'success':'fatal', (!playerFirst? 'You': tName) +' died');
        if(playerFirst){
          // Get a fresh list of items
          var items=this.state.items;
          // Add experience to player
          items['player'].stats.experience+=tXp;
          this._conslog('success', '... You gained '+tXp+' experience points');
          // Update the state
          this.setState({items:items, currentEnemy:null});
          // Check the current level
          this._hasLeveledUp('player');
          // Check the remaining enemies
          var objects=this._countItems();
          console.log(objects);
          if(objects['enemy']==undefined && objects['boss']==undefined){
            this._gameOver('You win !')
          }
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

  /**
   * Calculates the damages an attacker do on a target
   * @todo Add a failing possibility percentage
   *
   * @param string attacker - Attacker identifier in this.state.items
   * @param string target - Target identifier in this.state.items
   *
   * @return int - The amount of damage
   */
  _calcDamages(attacker, target){
    var f=this.state.items[attacker].stats;
    var s=this.state.items[target].stats;
    // Calculates the damage
    return Math.ceil(((10+f.strength)/10)*f.damage-s.armor);
  }

  /**
   * Adds messages to the quest log
   *
   * @param string type - Message type (info, success, danger fatal)
   * @param string message - The message. use '---' to create a separator
   */
  _conslog(type, message){
    var messages=this.state.messages
    if(message=='---'){
      messages.push({id:messages.length, type:'hr', message:'::--::--::'});
    }else{
      messages.push({id:messages.length, type:type, message:message});
    }
    this.setState({messages:messages});
  }

  /**
   * Changes the discovered property of cells around player.
   *
   * @param object items - Object containing the items, from MapGen. If null, will use state.items.
   * @param array grid - Grid from MapGen.If null, will use state.grid.
   * @param object cells - Object containing cells from MapGen. If null, will use state.cells.
   */
  _discoverAroundPlayer(items=null, grid=null, cells=null){
    if(!items){items=this.state.items;}
    if(!grid){grid=this.state.grid;}
    if(!cells){cells=this.state.cells;}
    var position=items.player.position;
    var playerPos=position.split(':')
    var playerX=Number(playerPos[0]);
    var playerY=Number(playerPos[1]);
    var mapWidth=grid[0].length;
    var mapHeight=grid.length;

    var matrix=[
                    [-1,-3], [ 0,-3], [ 1,-3],
           [-2,-2], [-1,-2], [ 0,-2], [ 1,-2], [ 2,-2],
  [-3,-1], [-2,-1], [-1,-1], [ 0,-1], [ 1,-1], [ 2,-1], [ 3,-1],
  [-3, 0], [-2, 0], [-1, 0], [ 0, 0], [ 1, 0], [ 2, 0], [ 3, 0],
  [-3, 1], [-2, 1], [-1, 1], [ 0, 1], [ 1, 1], [ 2, 1], [ 3, 1],
           [-2, 2], [-1, 2], [ 0, 2], [ 1, 2], [ 2, 2],
                    [-1, 3], [ 0, 3], [ 1, 3]
                  ];
    var matrix2=[
                                   [-1,-4], [ 0,-4], [ 1,-4],
                      [-2,-3],   /*[-1,-3], [ 0,-3], [ 1,-3],*/ [ 2,-3],
           [-3,-2], /*[-2,-2],     [-1,-2], [ 0,-2], [ 1,-2],   [ 2,-2],*/ [ 3,-2],
[-4,-1], /*[-3,-1],   [-2,-1],     [-1,-1], [ 0,-1], [ 1,-1],   [ 2,-1],   [ 3,-1],*/ [ 4,-1],
[-4, 0], /*[-3, 0],   [-2, 0],     [-1, 0], [ 0, 0], [ 1, 0],   [ 2, 0],   [ 3, 0],*/ [ 4, 0],
[-4, 1], /*[-3, 1],   [-2, 1],     [-1, 1], [ 0, 1], [ 1, 1],   [ 2, 1],   [ 3, 1],*/ [ 4, 1],
           [-3, 2], /*[-2, 2],     [-1, 2], [ 0, 2], [ 1, 2],   [ 2, 2],*/ [ 3, 2],
                      [-2, 3],   /*[-1, 3], [ 0, 3], [ 1, 3],*/ [ 2, 3],
                                   [-1, 4], [ 0, 4], [ 1, 4],
    ];
    console.log(matrix2.length)
    for(let i=0; i<matrix.length; i++){
      let newX=playerX+matrix[i][0];
      let newY=playerY+matrix[i][1];
      if(newX>=0 && newX<=mapWidth-1 && newY>=0 && newY<=mapHeight-1){
        cells[newX+':'+newY].type.discovered='visible';
      }
    }
    for(let i=0; i<matrix2.length; i++){
      console.log(matrix2[i]);
      let newX=playerX+matrix2[i][0];
      let newY=playerY+matrix2[i][1];
      if(newX>=0 && newX<=mapWidth-1 && newY>=0 && newY<=mapHeight-1){
        if(cells[newX+':'+newY].type.discovered=='no'){
          cells[newX+':'+newY].type.discovered='half';
        }else{
          console.log(cells[newX+':'+newY].type.discovered)
        }
      }
    }
    return cells;
  }

  /**
   * Update player's stat when i picks a life potion
   */
  _potion_life(){
    var quantity=50;
    var items=this.state.items;
    items['player'].stats.life=(items['player'].stats.life+quantity>items['player'].stats.totalLife?items['player'].stats.totalLife:items['player'].stats.life+quantity);
    this.setState({items:items});
  }
  /**
   * Update player's stat when i picks an armor token
   */
  _token_armor(){
    var items=this.state.items;
    items['player'].stats.armor+=1;
    this.setState({items:items});
  }
  /**
   * Update player's stat when i picks a damage token
   */
  _token_damage(){
    var items=this.state.items;
    items['player'].stats.damage+=1;
    this.setState({items:items});
  }
  /**
   * Update player's stat when i picks a strength token
   */
  _token_strength(){
    var items=this.state.items;
    items['player'].stats.strength+=1;
    this.setState({items:items});
  }
  /**
   * Update player's stat when i picks a celerity token
   */
  _token_celerity(){
    var items=this.state.items;
    items['player'].stats.celerity+=1;
    this.setState({items:items});
  }

  /**
   * Generates a map name
   *
   * @return string - A wonderful map name
   */
  _mapName(){
    var adj=MAP_NAME_ADJECTIVES[Math.floor(Math.random()*MAP_NAME_ADJECTIVES.length)];
    var noun=MAP_NAME_NOUNS[Math.floor(Math.random()*MAP_NAME_NOUNS.length)];
    var adverb=MAP_NAME_ADVERBS[Math.floor(Math.random()*MAP_NAME_ADVERBS.length)];

    return adj + ' ' + noun + ' of ' + adverb;
  }

  /**
  * Hides the info area using jquery as not important.
  */
  _hideInfo(){
    $('#infoMessage').toggle()
  }
}


/*******************************************************************************

GAME CONSTANTS FOR INITIAL generation

*/
// Some names for level naming
const MAP_NAME_ADJECTIVES=['Dark', 'Scealled', 'Obscure', 'Final', 'Chaotic', 'Rancid', 'Moldy', 'Hellish'];
const MAP_NAME_NOUNS=['floor', 'cave', 'den', 'lair', 'cavern'];
const MAP_NAME_ADVERBS=['destruction', 'sorrow', 'chaos', 'Cthulhu', 'famine', 'death', 'pain', 'Doom', 'Hell'];

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
  wall:    {name:'wall',   isWalkable:false, classNames:['wall'],  discovered:'no', isBaseCell:true},
  floor:   {name:'floor',  isWalkable:true,  classNames:['floor'], discovered:'no', isBaseCell:true},
  lava:    {name:'lava',   isWalkable:true,  classNames:['lava'],  discovered:'no', damage:1},
  water:   {name:'water',  isWalkable:true,  classNames:['water'], discovered:'no'},
};

const ITEMS={
  tomb_stone_player: {name:'You',               description: 'Something took your life away... And broke your hat...', type:'special', storable:false, consumable:false, className:'tomb-player', stats:{life:0}},
  tomb_stone:        {name:'a corpse',          description: 'A dead enemy',                    type:'special', storable:false, consumable:false, className:'tomb', stats:{life:0}},
  tomb_stone_boss:   {name:'a large corpse',    description: 'A dead powerful enemy',           type:'special', storable:false, consumable:false, className:'tomb-boss', stats:{life:0}},
  life_potion:       {name:'Life potion',       description: 'Gives you 50 points of life',     type:'item',    storable:false, consumable:true,  className:'health', effect:'_potion_life'},
  token_strength:    {name:'Token of strength', description: 'Adds 1 to your strength',         type:'item',    storable:true,  consumable:false, className:'chest',  effect:'_token_strength'},
  token_damage:      {name:'Token of damage',   description: 'Adds 1 to your damage',           type:'item',    storable:true,  consumable:false, className:'chest',  effect:'_token_damage'},
  token_armor:       {name:'Token of armor',    description: 'Adds 1 to your armor',            type:'item',    storable:true,  consumable:false, className:'chest',  effect:'_token_armor'},
  token_celerity:    {name:'Token of celerity', description: 'Adds 1 to your celerity',         type:'item',    storable:true,  consumable:false, className:'chest',  effect:'_token_celerity'},
};

// Some bosses :
const BOSSES=[
  {type:'boss', name:'Joker', description:'The Joker is a fictional supervillain who appears in American comic books published by DC Comics. The character was created by Jerry Robinson, Bill Finger, and Bob Kane, and first appeared in Batman #1.', more:'http://www.ranker.com/review/joker/2498261?ref=name_320416'},
  {type:'boss', name:'Hannibal Lecter', description:'Dr. Hannibal Lecter is a character in a series of suspense novels by Thomas Harris. Lecter was introduced in the 1981 thriller novel Red Dragon as a forensic psychiatrist and cannibalistic serial killer.', more:'http://www.ranker.com/review/hannibal-lecter/1125580?ref=name_320416'},
  {type:'boss', name:'Jack Torrence', description:'John Daniel "Jack" Torrance is a fictional character in the 1977 novel The Shining by Stephen King.', more:'http://www.ranker.com/review/jack-torrance/1254047?ref=name_320416'},
  {type:'boss', name:'Freddy Kruegger', description:'Fred "Freddy" Krueger is the main antagonist of the A Nightmare on Elm Street film series. He first appeared in Wes Craven\'s A Nightmare on Elm Street as a burnt serial killer who uses a glove armed with razors to kill his victims in their dreams', more:'http://www.ranker.com/review/freddy-krueger/1022376?ref=name_320416'},
];

// Some enemies :
const ENEMIES=[
  {type:'enemy', name:'Gloom Lad', description:'I have all the characteristics of a human being: blood, flesh, skin, hair; but not a single, clear, identifiable emotion, except for greed and disgust.', more:null},
  {type:'enemy', name:'Killer Woman', description:'I visited your home this morning after you\'d left. I tried to play husband. I tried to taste the life of a simple man. It didn\'t work out, so I took a souvenir... her pretty head.', more:null},
  {type:'enemy', name:'Master Man', description:'The point is ladies and gentlemen that greed, for lack of a better word, is good.', more:null},
  {type:'enemy', name:'Necrotic Murderer', description:'Human beings are a disease, a cancer of this planet. You\'re a plague and we are the cure.', more:null},
  {type:'enemy', name:'Sickness Master', description:'I\'m going to do something now they used to do in Vietnam. It\'s called making a head on a stick.', more:null},
  {type:'enemy', name:'Viral Shade', description:'If Mr. McMurphy doesn\'t want to take his medication orally, I\'m sure we can arrange that he can have it some other way. But I don\'t think that he would like it.', more:null},
];

const HOSTILES=['boss', 'enemy']

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
