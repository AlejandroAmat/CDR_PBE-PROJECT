
require "gtk3"
require "thread"
require "httpx"
require "json"
require "puzzle1"
require "ruby-nfc"
require_relative "taulaF"
#require 'i2c/drivers/lcd'
require 'facets/timer'

class Finestra
        attr_accessor :label, :window, :window2, :grid, :grid2, :blau, :blanc, :vermell, :lector, :uid, :button, :search, :taula, :timer, :font, :label2
      

        def initialize
                #Variables d'interès
                @resposta=""
                @req = ""
                @rf= Rfid.new
                @files=0
                @timer
                #@display = I2C::Drivers::LCD::Display.new('/dev/i2c-1', 0x27)
                #@display.clear
                #@display.text(' Please, login with',0)
                #@display.text(' your university card:',1)
                #@timer = Timer.new

                #Configuració de la finestra inicial
                @window = Gtk::Window.new("Critical Design")
                @window.set_title("Lector MFRC522")
                @window.set_default_size(400,400)
                @window.set_border_width(10)
                @window.set_window_position(:CENTER)
               # @window.signal_connect('destroy') { Gtk.main_quit }
                
                #Finestra login
                @window2 = Gtk::Window.new("Critical Design")
                @window2.set_title("Login")
                @window2.set_default_size(400,400)
                @window2.set_border_width(10)
                @window2.set_window_position(:CENTER)
               # @window2.signal_connect('destroy') { Gtk.main_quit }
                @font=Pango::FontDescription.new('15')
                
                
    
        end
        
      def init
        @window = Gtk::Window.new("Critical Design")
                @window.set_title("Lector MFRC522")
                @window.set_default_size(400,400)
                @window.set_border_width(10)
                @window.set_window_position(:CENTER)
        @window2 = Gtk::Window.new("Critical Design")
                @window2.set_title("Login")
                @window2.set_default_size(400,400)
                @window2.set_border_width(10)
                @window2.set_window_position(:CENTER)
                puts "HASTA AQUI LLEGA"        
                startWindow1
               
      end
      

      def startWindow1

                #Configuració del label
                

    @label=Gtk::Label.new("Please put your card on the reader")

    @label.override_font(@font)
   

                #Configuració del grid
                @grid = Gtk::Grid.new
                @window.add(@grid)
                @grid.set_column_homogeneous(true)
                @grid.set_row_spacing(7)
                @grid.attach(@label,0,0,5,5)

               # @button=Gtk::Button.new(:label => "L")
                #@button.signal_connect('clicked') {login("error")}
               # @grid.attach(@button,1,0,9,1)
                
                @window.show_all
                puts "Finestra creada"
                self.newthread

      end
     


      def newthread
        tr=Thread.new {
                get_user
                puts "YA"
                tr.exit
        }

      end
 

      def logout

        req=HTTPX.get('http://172.20.10.2:4344?d?').to_str
        puts req #disconnected
        @timer.stop
        @timer.reset
        #volver a la startWindow. eliminar Tablas actuales y volver a poner todo como estaba. Yo no sé
        endWindow2
        init
        @timer.reset


      end

        def get_user

          puts "Entro fil"
          @uid = @rf.read_uid.to_s
          puts @uid
          @url = 'http://172.20.10.2:4344?' + @uid
          @resposta = HTTPX.get(@url).to_str
          
          puts @resposta

          login(@resposta)



        end

          def login(resposta)
          puts resposta

                if resposta.eql? 'error'
                        puts "Usuari no trobat"
                        startWindow1

                else
                        puts "WELCOME " + resposta
                        timer_manage
                        endWindow1
                        puts "END Window1"
                        startWindow2

                        #@display.clear
                       # @display.text('      Welcome:',0)
                        #@display.text(resposta,1)
                        #@timer.start
                end
          end

    def startWindow2
                
                #@grid.remove_row(0)
                #@grid.remove_column(0)
                @grid2=Gtk::Grid.new
                @window2.add(@grid2)
                puts "llego aquí"
                #Creem la pagina d'inici
                welcome = "WELCOME " + @resposta
                @label2= Gtk::Label.new(welcome)
                @label2.override_font(@font)
                @button=Gtk::Button.new(:label => "Logout")
                @button.signal_connect('clicked') {logout}
                  puts "llego akix2"
                  
                  
                @grid2.set_row_spacing(10)
                al=Gtk::Align.new(2)
                @button.set_halign(al)
                @button.set_hexpand(true)
                
                @search=Gtk::Entry.new

                @grid2.attach(@button,1,0,9,1)
                @grid2.attach(@label2,0,0,1,1)
                
                @grid2.attach(@search,0,7,10,1)
                
                puts "LLEGO AKIx3"
               
                @window2.show_all
                
                
                
                
                  @search.signal_connect "activate" do |_widget|
                        puts "LLEGO"
                        @timer.stop
                        @timer.reset
                        @timer.start
                        t = Thread.new{

                        @url = 'http://172.20.10.2:4344?' + @search.text
                        @resposta = HTTPX.get(@url).to_str
                        #@resposta= '{"result":[{"date":"2021-11-20T23:00:00.000Z","subject":"PBE","name":"Entrega Proyecto"},{"date":"2021-11-21T23:00:00.000Z","subject":"DSBM","name":"Memoria 4"},{"date":"2021-11-22T23:00:00.000Z","subject":"PBE","name":"Project Plan"},{"date":"2021-12-05T23:00:00.000Z","subject":"DSBM","name":"Memoria 5"},{"date":"2021-12-20T23:00:00.000Z","subject":"PBE","name":"Finale Report"}]}'
                        puts @resposta
                        t.exit
                        }
                        #S'ha de crear un label vermell amb la @search.text.chomp(?).[0]
                        t.join
                        j=0
                        if @files!=0
							loop do
     
							if j==@files
							break
		                    end
							@grid2.remove_row(14)
							j=j+1
						    end
					    end
                         
                         if @resposta.to_str != 'error'

                         @taulaobj = Taula.new
                         @taula = @taulaobj.crearTaula(@resposta)
                           if @taula != nil
                              @files = @taulaobj.numFiles
                              @taula.set_hexpand(true)
                             al2=Gtk::Align.new(3) 
                             @taula.set_halign(al2)
                            @grid2.attach(@taula,0,14,10,@files)
                         
                         @window2.show_all
                          else
                        puts "empty set"
                          end
                        else
                        puts  "error in sql comprobation"
                        end

                end

              
      end
      
      def endWindow1
        @window.destroy
        
      end
      def endWindow2
      @window2.destroy
      end

      def timer_manage
        @timer = Timer.new(10){
               puts "10 seconds"
               endWindow2
               init
              
               req=HTTPX.get('http://172.20.10.2:4344?d?').to_str
              
               
               
              
               
        }
        @timer.start

      end
end







fin = Finestra.new
fin.startWindow1

Gtk.main
