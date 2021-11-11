DDL: Tables as Quotes,  EarningCalendar, Fundamental
```SQL
create table Quotes
(
    symbol        varchar(20)   not null
        primary key,
    open          decimal(5, 2) null,
    close         decimal(5, 2) null,
    high          decimal(5, 2) null,
    low           decimal(5, 2) null,
    volume        int           null,
    changePercent decimal(5, 2) null
);
create table EarningCalendar
(
    symbol     varchar(20)  not null
        primary key,
    name       varchar(200) null,
    reportDate varchar(20)         null
);
create table Fundamental
(
    symbol  varchar(20)   not null
        primary key,
    name    varchar(200)  null,
    sector  varchar(20)   null,
    peratio decimal(5, 2) null,
    roe     decimal(5, 2) null,
    psratio decimal(5, 2) null
);
```
