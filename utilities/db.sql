CREATE TABLE interviews
(
    id integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 0 MINVALUE 0 ),
    task character varying(50) NOT NULL,
    "time" timestamp with time zone NOT NULL,
    ta character varying(50) NOT NULL,
    student character varying(50),
    length integer,
    location character varying DEFAULT 'Zoom',
    cancelled boolean NOT NULL DEFAULT false,
    note character varying,
    PRIMARY KEY (id)
);

CREATE TABLE ta
(
    username character varying NOT NULL,
    password character varying NOT NULL,
    PRIMARY KEY (username)
);

CREATE TABLE text
(
    paragraph bigint NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 ),
    likes bigint NOT NULL DEFAULT 0,
    content character varying,
    PRIMARY KEY (paragraph)
);

CREATE TABLE users
(
    username character varying(256) NOT NULL,
    PRIMARY KEY (username)
);

CREATE TABLE marks
(
    student character varying NOT NULL,
    task character varying NOT NULL,
    criteria character varying NOT NULL,
    mark numeric,
    total numeric,
    description character varying,
    PRIMARY KEY (student, task, criteria)
);

CREATE TABLE ddah
(
    username character varying NOT NULL,
    duty character varying NOT NULL,
    "time" integer NOT NULL,
    supervisor_prepared timestamp with time zone,
    chair_approved timestamp with time zone,
    ta_accepted timestamp with time zone,
    PRIMARY KEY (username, duty),
    CONSTRAINT username FOREIGN KEY (username)
        REFERENCES ta (username) MATCH SIMPLE
        ON UPDATE RESTRICT
        ON DELETE RESTRICT
        NOT VALID
);
