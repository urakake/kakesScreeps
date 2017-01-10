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
	makeScout: function(spawn){
	    var creepName="scout"+spawn.room.memory.creepIter+"@"+spawn.room.name+"-"+spawn.room.memory.scoutRoom;
	    spawn.createCreep( makeParts(6,4,5,0), creepName, { role: 'scout', scoutRoom: spawn.room.memory.scoutRoom  } );
	},
	checkScouts: function(spawn){
	    //console.log(spawn.room.memory.scoutRoom)
	    var needScout=false;
	    if(spawn.room.memory.scoutRoom!=undefined){
	        needScout=true;
            var scoutRoom=Game.rooms[spawn.room.memory.scoutRoom];
            //console.log(scoutRoom.memory.numDrones)
            //if(scoutRoom!=undefined && (scoutRoom.memory.numScouts>0 || scoutRoom.memory.numDrones>0 || spawn.room.memory.numScouts>0)){
            if(scoutRoom!=undefined && ((scoutRoom.memory.numScouts+scoutRoom.memory.numDrones+spawn.room.memory.numScouts)>1)){
                //console.log("found all scouts")
                needScout=false;
            }
	    }
	    return needScout;
	}
};

function work(creep) {
	if(creep.memory.state == "traverse") {
	    traverse(creep);
	} else if(creep.memory.state == "move"){
	    getAwayFromWall(creep)
	} else if(creep.memory.state == "drone"){
		creep.memory.role="drone";
		creep.memory.init=false;
	}
}

function traverse(creep){
    var targetRoom=creep.memory.scoutRoom
    if(creep.room.name != targetRoom){
        voyageOutOfRoom(creep,targetRoom);
    } else {
        creep.moveTo(creep.room.controller.pos);
        becomeDrone(creep);
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
            console.log("NE")
            creep.moveTo(creep.pos.x-1,creep.pos.y+1);
            break;
        case "NW":
            console.log("NW");
            creep.moveTo(creep.pos.x+1,creep.pos.y+1);
            break;
        case "SE":
            console.log("SE");
            creep.moveTo(creep.pos.x-1,creep.pos.y-1);
            break;
        case "SW":
            console.log("SW");
            creep.moveTo(creep.pos.x+1,creep.pos.y-1);
            break;
        default:
    }
    
}
function becomeDrone(creep){
    creep.memory.role="drone";
    creep.memory.init=false;
}
function makeParts(moves, carries, works, claim) {
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
	creep.memory.scoutRoom=creep.room.memory.scoutRoom;
	creep.memory.state="traverse"
}
module.exports = roleScout;