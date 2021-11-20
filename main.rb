require "gtk3"
require "thread"
require "httpx"
require "json"
require "puzzle1"
require_relative "taula"
#require 'i2c/drivers/lcd'
require 'facets/timer'

class Finestra 
        attr_accessor :label, :window, :grid, :blau, :blanc, :vermell, :lector, :uid, :button, :search, :taula
        @timer
        
        def initialize
                #Variables d'interès
                @resposta=""
                @req = ""
                @rf= Rfid.new
                #@display = I2C::Drivers::LCD::Display.new('/dev/i2c-1', 0x27)
                #@display.clear
                #@display.text(' Please, login with',0)
                #@display.text(' your university card:',1)
                #@timer = Timer.new
                
                #Configuració de la finestra
                @window = Gtk::Window.new("Critical Design")
                @window.set_title("Lector MFRC522")
                @window.set_default_size(400,400)
                @window.set_border_width(10)
                @window.set_window_position(:CENTER)
                @window.signal_connect('destroy') { Gtk.main_quit }
                
                #Configuració del label 
                @label = Gtk::Label.new("")
                
                #Configuració del grid
                @grid = Gtk::Grid.new
                @grid.set_column_homogeneous(true)
                @grid.set_row_spacing(7)
                @grid.attach(@label,0,0,5,5)
                
               # @button=Gtk::Button.new(:label => "L")
                #@button.signal_connect('clicked') {login("error")}
               # @grid.attach(@button,1,0,9,1)
                @window.add(@grid)
                @window.show_all
                puts "Finestra creada"
                
                @search=Gtk::Entry.new
                 
                   @search.signal_connect "activate" do |_widget|
                        puts "LLEGO"
                        @timer.stop
                        @timer.reset
                        @timer.start
                        t = Thread.new{
                      
                        @url = 'http://172.20.10.2:4344?' + @search.text                                   
                        @resposta = HTTPX.get(@url).to_str
                        puts @resposta
                        t.exit
                        }
                        t.join
                        #FALTA: Borrar taula ja existent si existeix
                         if @resposta.to_str != 'error' 
                         
                         @taula = Taula.new.crearTaula(@resposta)
                         if @taula != nil
                         @grid.attach(@taula,0,2,10,10)
                         @window.show_all
                        else
                        puts "empty set"
                        end
                        else
                        puts  "error in sql comprobation"
                        end
                        
                 end
              
                
                
                
end
      
      def startWindow
      
                @label.text="Introduce your card"
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
        startWindow
        
        
      end
        
        def get_user
          
          puts "Entro fil"
          @uid = @rf.read_uid 
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
                        self.startWindow
                
                else
                        puts "WELCOME " + resposta
                        timer_manage
                        initPageBuilder
                        
                        #@display.clear
                       # @display.text('      Welcome:',0)
                        #@display.text(resposta,1)
                        #@timer.start
                end
          end
     
    def initPageBuilder
                #Borrem el label que teniem
                @label.destroy
                @grid.remove_row(0)
                @grid.remove_column(0)
                
                #Creem la pagina d'inici
                welcome = "WELCOME " + @resposta
                @label= Gtk::Label.new(welcome)
                @button=Gtk::Button.new(:label => "Logout")
                @button.signal_connect('clicked') {logout}
             
                
                al=Gtk::Align.new(2)
                @button.set_halign(al)
                @button.set_hexpand(true)
                
                @grid.attach(@button,1,0,9,1)
                @grid.attach(@label,0,0,1,1)
                @grid.set_row_spacing(20)
                @grid.attach(@search,0,7,10,1)
                @window.add(@grid)
		@window.show_all
      end 

      def timer_manage
        @timer = Timer.new(10){
               puts "10 seconds"
               req=HTTPX.get('http://172.20.10.2:4344?d?').to_str
               startWindow
               #De nou aqui hem deliminar la taula que hi hagi i ficar la finestra original
        }
        @timer.start

           end     
    end           
                
                       
	 
   



fin = Finestra.new
fin.startWindow

Gtk.main




