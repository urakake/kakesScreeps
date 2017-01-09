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
    creep.memory.targetRoom;
    if(creep.memory.targetRoom==undefined){
	    creep.memory.targetRoom="none";
	}
	if(creep.memory.role==undefined){
	    creep.memory.role="scout";
	}
	creep.memory.state="traverse"
}
function work(creep) {
	if(creep.memory.state == "traverse") {
	    var targetRoom=Game.rooms[creep.memory.targetRoom];
	    if(creep.room.name != targetRoom){
            voyage(creep,targetRoom);
        } else {
            creep.memory.state = "claim";
        }
	}else if(creep.memory.state == "claim"){
		if(creep.claimController(targetRoom.controller) == ERR_NOT_IN_RANGE){
			creep.moveTo(targetRoom.controller);
		} 
	} 
}
function voyage(creep,destRoom) {
    var exitDir = Game.map.findExit(creep.room.name, destRoom);
    var Exit = creep.pos.findClosestByPath(exitDir);
    creep.moveTo(Exit);
}


module.exports = roleScout;