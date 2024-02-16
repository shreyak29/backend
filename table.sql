create table master_user_table(
    uid int primary key AUTO_INCREMENT,
    u_type varchar(10) check(u_type in('admin','student','head','assistant','mess incharge')),
    username varchar(25),
    pswd varchar(20),
    UNIQUE(username),
    CONSTRAINT chk_uname CHECK(username LIKE '%_@__%.__%')
);

alter table master_user_table modify username varchar(50);
insert into master_user_table(u_type,username,pswd) values('admin','admin123@gmail.com','iamadmin1');
insert into master_user_table(u_type,username,pswd) values('student','btbtc21422_shreya@banasthali.in','btbtc21422');

create table course_tbl(
    c_id varchar(10) primary key,
    program varchar(10) not null,
    sub varchar(20),
    yr year not null,
    no_st numeric
);

create table hostel_user_tbl(
    h_id varchar(10),
    c_id varchar(10), 
    no_of_stu numeric,
    foreign key(c_id) references course_tbl(c_id),
    constraint pk_hostel_course primary key(h_id,c_id)
);

create table hostel_user_tbl(
    h_id varchar(10),
    room_no numeric not null,
    floor_no numeric not null,
    no_seats numeric,
    vaccant numeric,
    foreign key(h_id) references hostel_master_tbl(h_id),
    constraint pk_room primary key(h_id,room_no)
);

