/** -------------------------------------------- role.scout ------------------------------------------
 * @param {Creep} creep 
 * by Urakake     **/
		
var roleScout = {
     run: function(creep) {
        if(!creep.memory.init){
            init(creep);
        }
        work(creep);
	}
};
function init(creep) {
    console.log("Initializing Scout - "+creep.name);
    creep.memory.init=true;
    if(creep.memory.targetRoom==undefined){
	    creep.memory.targetRoom="none";
	}
	if(creep.memory.role==undefined){
	    creep.memory.role="scout";
	}
	creep.memory.contX=36;
    creep.memory.contY=18;
	creep.memory.state="traverse"
}
function work(creep) {
	if(creep.memory.state == "traverse") {
	    var targetRoom=Memory.rooms[creep.memory.targetRoom];
	    if(creep.room.name != targetRoom.name){
	        //console.log(creep.room.name+" - "+creep.memory.targetRoom)
            voyage(creep,targetRoom);
        } else {
            //console.log("voyageDone");
            creep.memory.state = "find";
            creep.say("find")
        }
	} else if(creep.memory.state == "find"){
	    if(creep.pos.getRangeTo(creep.memory.contX,creep.memory.contY)>2){
	        creep.moveTo(creep.memory.contX,creep.memory.contY);
	    } else {
	        creep.memory.state = "claim"
	        creep.say("claim")
	    }
	} else if(creep.memory.state == "claim"){
	    //creep.memory.state = "traverse";
		if(targetRoom && creep.claimController(targetRoom.controller) == ERR_NOT_IN_RANGE){
			creep.moveTo(targetRoom.controller);
		} 
	} 
}
function voyage(creep,destRoom) {
    //console.log("find room")
    var exitDir = Game.map.findExit(creep.room.name, destRoom);
    var Exit = creep.pos.findClosestByPath(exitDir);
    creep.moveTo(Exit);
}


module.exports = roleScout;