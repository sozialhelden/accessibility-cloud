// This is a temporary helper class to populate the
// Database with some test-data
Setup = (function() {

    var that= this;


    var _setupSubjects= function() {        
        Subjects.remove({});

        _.map( subject_data, function(subject) {
            Subjects.insert( subject );
        });
    };

    return {
        timezone:'-1',

        rebuildDatabase: function () {
            console.log("rebuildDatabase()");

            Lessons.remove({});
            var sample_lesson_id= Lessons.insert(Stubs.lessons[0]);

            Materials.remove({});
            var sample_material = Materials.insert(Stubs.materials[0]);

            UserSessions.remove();

            // insert 2015/2016
            Terms.remove();
            Terms.insert({
                title:'2015/2016',
                starttime: moment('2015-08-01 05:00:00').utc().toDate(),
                endtime:   moment('2016-07-31 05:00:00').utc().toDate(),
                user_id:'_system_user',
                holidays:[
                    {
                        title:'Weihnachten',
                        starttime: moment('2015-12-24 00:00:00').utc().toDate(),
                        endtime:   moment('2015-12-26 23:59:00').utc().toDate(),
                    }
                ]
            });

            Courses.remove();

            // Templates.remove();
            // _.each(Stubs.templates, function(t) {
            //     Templates.insert(t);
            // });

            _setupSubjects();
        },
    };
}());

