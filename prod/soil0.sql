-- -----------------------------------------------------
-- Schema soil
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Table vehicle
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS vehicle (
  id 				INT 			NOT NULL AUTO_INCREMENT,
  brand 			VARCHAR(255) 	NOT NULL,
  model 			VARCHAR(255) 	NOT NULL,
  type 				VARCHAR(255) 	NOT NULL,
  manuf_year_start 	INT 			NOT NULL,
  manuf_year_end	INT 			NOT NULL,
  PRIMARY KEY (id)
);


-- -----------------------------------------------------
-- Table catalog
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS catalog (
  id 			INT 			NOT NULL AUTO_INCREMENT,
  name 			VARCHAR(255) 	NOT NULL,
  type 			VARCHAR(255) 	NOT NULL,
  specification VARCHAR(255) 	NOT NULL,
  PRIMARY KEY (id)
);


-- -----------------------------------------------------
-- Table technical_specification
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS technical_specification (
  id 			INT NOT NULL AUTO_INCREMENT,
  catalog_id 	INT NOT NULL,
  vehicle_id 	INT NOT NULL,
  PRIMARY KEY 	(id),
  CONSTRAINT 	fk_technical_specification_catalog
    FOREIGN KEY (catalog_id)
    REFERENCES 	catalog (id),
  CONSTRAINT 	fk_technical_specification_vehicle
    FOREIGN KEY (vehicle_id)
    REFERENCES 	vehicle (id)
);


-- -----------------------------------------------------
-- Table user
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS user (
  id 		INT 			NOT NULL AUTO_INCREMENT,
  cnpj		VARCHAR(18)		NOT NULL,
  name 		VARCHAR(255) 	NOT NULL,
  email 	VARCHAR(255) 	NOT NULL,
  password_hash VARCHAR(255)   NOT NULL,
  phone 	VARCHAR(15) 	NOT NULL,
  PRIMARY KEY (id),
  UNIQUE INDEX cnpj_UNIQUE (cnpj ASC) VISIBLE,
  UNIQUE INDEX email_UNIQUE (email ASC) VISIBLE
);


-- -----------------------------------------------------
-- Table product
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS product (
  id 			INT 			NOT NULL AUTO_INCREMENT,
  user_id 	INT 			NOT NULL,
  catalog_id 	INT 			NOT NULL,
  price 		DECIMAL(10,2) 	NOT NULL,
  brand 		VARCHAR(50) 	NOT NULL,
  type 			ENUM('FILTRO', 'OLEO') 	NOT NULL,
  PRIMARY KEY (id),
  CONSTRAINT fk_product_user
    FOREIGN KEY (user_id)
    REFERENCES user (id),
  CONSTRAINT fk_product_catalog
    FOREIGN KEY (catalog_id)
    REFERENCES catalog (id)
);
