/** -------------------------------------------- role.scout ------------------------------------------
 * @param {Creep} creep 
 * Game.spawns('Spawn1').
 * by Urakake     **/
		
var roleScout = {
    run: function(creep) {
        if(!creep.memory.init){
            init(creep);
        }
        work(creep);
	},
	checkScouts: function(spawnRoom,scoutRoom){
	    
	},
	makeScout: function(spawn){
	    
	}
};

function work(creep) {
	if(creep.memory.state == "traverse") {
	    traverse(creep);
	} else if(creep.memory.state == "move"){
	    acquireEnergy(creep)
	} else if(creep.memory.state == "drone"){
		creep.memory.role="drone";
		creep.memory.init=false;
	}
}
function traverse(creep){
    var targetRoom=creep.memory.targetRoom
    if(creep.room.name != targetRoom){
        voyageOutOfRoom(creep,targetRoom);
    } else {
        creep.memory.state = "aquireEnergy";
        work(creep)
    }
}
function voyageOutOfRoom(creep,destRoom) {
    var exitDir = Game.map.findExit(creep.room.name, destRoom);
    var Exit = creep.pos.findClosestByPath(exitDir);
    creep.moveTo(Exit);
}
function getAwayFromWall(creep){
    var position="";
    if(creep.pos.y<25){ //north
        position+="N";
    } else{             //south
        position+="S";
    }
    if(creep.pos.x<25){     // west
        position+="w";
    } else {                //east
        position+="E";
    }
    switch(position) {
        case "NE":
            
            break;
        case "NW":
            
            break;
        case "SE":
            
            break;
        case "SW":
            
            break;
        default:
    }
}

function makeParts(moves, carries, works) {
    var list = [];
    for(var i=0;i<moves;i++){
        list.push(MOVE);
    }
    for(var i=0;i<carries;i++){
        list.push(CARRY);
    }
    for(var i=0;i<works;i++){
        list.push(WORK);
    }
    return list;
}
function init(creep) {
    console.log("Initializing Scout - "+creep.name);
    creep.memory.init=true;
    creep.memory.role="scout";
	creep.memory.targetRoom=creep.room.memory.scoutRoom;
	creep.memory.state="traverse"
}
module.exports = roleScout;