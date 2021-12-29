export async function defineDbRelations(db, Models) {
    const { Course, Homework, Lesson, User, File, Result } = Models

    User.hasMany(Homework, { foreignKey: 'studentId' })
    Homework.belongsTo(User, { foreignKey: 'studentId' })

    Course.hasMany(Lesson, { foreignKey: 'courseId' })
    Lesson.belongsTo(Course, { foreignKey: 'courseId' })

    Lesson.hasMany(Homework, { foreignKey: 'lessonId' })
    Homework.belongsTo(Lesson, { foreignKey: 'lessonId' })

    Lesson.hasMany(File, { foreignKey: 'sourceId', constraints: false })
    File.belongsTo(Lesson, { foreignKey: 'sourceId', constraints: false })

    Homework.hasMany(File, { foreignKey: 'sourceId', constraints: false })
    File.belongsTo(Homework, { foreignKey: 'sourceId', constraints: false })

    Course.hasMany(Result, { foreignKey: 'courseId' })
    Result.belongsTo(Course, { foreignKey: 'courseId' })

    User.hasMany(Result, { foreignKey: 'studentId' })
    Result.belongsTo(User, { foreignKey: 'studentId' })

    await db.sync()
}
