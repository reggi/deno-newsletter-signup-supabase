create table
  public.newsletter (
    id serial,
    email character varying(255) not null,
    subscribed_on timestamp without time zone null default current_timestamp,
    constraint makers_newsletter_pkey primary key (id),
    constraint makers_newsletter_email_key unique (email)
  ) tablespace pg_default;